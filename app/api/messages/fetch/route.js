import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../../../lib/mongodb"; 
import Message, { RoomProfile } from "../../../../models/Message";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

async function resolveRoomContext(cleanChannel, cleanUserId, cleanPartnerId) {
  let roomDoc = null;
  try {
    const db = mongoose.connection.db;
    if (db) {
      const roomsCol = db.collection("rooms");
      const allRooms = await roomsCol.find({}).sort({ _id: -1 }).toArray();
      const chLower = cleanChannel.toLowerCase();
      const uLower = cleanUserId.toLowerCase();

      roomDoc = allRooms.find((r) => {
        const rNode = String(r.nodeName || r.name || r.roomName || "").trim().toLowerCase();
        if (chLower && rNode === chLower) return true;

        const u1 = String(r.user1 || "").trim().toLowerCase();
        const u2 = String(r.user2 || "").trim().toLowerCase();
        if (uLower && (u1 === uLower || u2 === uLower)) return true;

        if (Array.isArray(r.users) && r.users.some((u) => String(u).trim().toLowerCase() === uLower)) {
          return true;
        }
        return false;
      });
    }
  } catch (e) {}

  const sortedPair = [cleanUserId.toLowerCase(), cleanPartnerId.toLowerCase()]
    .filter(Boolean)
    .sort()
    .join("_");

  const roomKey = roomDoc
    ? "room_" + String(roomDoc._id)
    : "chan_" + (cleanChannel.toLowerCase() || "default") + "_" + sortedPair;

  let roomCreatedAt = null;
  if (roomDoc) {
    if (roomDoc.createdAt) {
      roomCreatedAt = new Date(roomDoc.createdAt);
    } else if (roomDoc._id && typeof roomDoc._id.getTimestamp === "function") {
      roomCreatedAt = roomDoc._id.getTimestamp();
    }
  }

  return { roomKey, roomCreatedAt };
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      userId,
      partnerId = "",
      channel = "",
      action,
      msgId,
      pinnedUntil,
      deletedEncryptedText,
      profileImage,
      statusItem,
      statusId,
      viewerName,
      viewerPfp,
      viewTime,
      callItem,
      callId,
      emoji
    } = body;

    const cleanUserId = String(userId || "").trim();
    const cleanUserLower = cleanUserId.toLowerCase();
    const cleanPartnerId = String(partnerId || "").trim();
    const cleanPartnerLower = cleanPartnerId.toLowerCase();
    const cleanChannel = String(channel || "").trim();

    const { roomKey, roomCreatedAt } = await resolveRoomContext(cleanChannel, cleanUserId, cleanPartnerId);

    // =========================================================================
    // 1. HANDLE PROFILE, STATUS & CALL LOG ACTIONS IN MONGODB
    // =========================================================================
    if (action === "UPDATE_PROFILE_IMAGE") {
      await RoomProfile.findOneAndUpdate(
        { roomKey: roomKey, userId: cleanUserLower },
        { channel: cleanChannel, profileImage: profileImage || "", updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, roomKey: roomKey });
    }

    if (action === "ADD_STATUS" && statusItem) {
      const existing = await RoomProfile.findOne({ roomKey: roomKey, userId: cleanUserLower });
      const now = Date.now();
      const validStatuses = (existing?.statuses || []).filter((s) => (now - s.time) < TWENTY_FOUR_HOURS);
      validStatuses.push({
        id: String(statusItem.id || Date.now()), image: statusItem.image, text: statusItem.text || "", time: Number(statusItem.time || now), seenBy: []
      });
      await RoomProfile.findOneAndUpdate(
        { roomKey: roomKey, userId: cleanUserLower },
        { channel: cleanChannel, statuses: validStatuses, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, statuses: validStatuses });
    }

    if (action === "DELETE_STATUS" && statusId) {
      const existing = await RoomProfile.findOne({ roomKey: roomKey, userId: cleanUserLower });
      const updatedStatuses = (existing?.statuses || []).filter((s) => String(s.id) !== String(statusId));
      await RoomProfile.findOneAndUpdate({ roomKey: roomKey, userId: cleanUserLower }, { statuses: updatedStatuses, updatedAt: new Date() }, { upsert: true });
      return NextResponse.json({ success: true, statuses: updatedStatuses });
    }

    if (action === "VIEW_PARTNER_STATUS" && statusId && cleanPartnerLower) {
      const partnerProf = await RoomProfile.findOne({ roomKey: roomKey, userId: cleanPartnerLower });
      if (partnerProf && Array.isArray(partnerProf.statuses)) {
        let updated = false;
        const newStatuses = partnerProf.statuses.map((st) => {
          if (String(st.id) === String(statusId)) {
            const seenList = Array.isArray(st.seenBy) ? st.seenBy : [];
            if (!seenList.some((v) => String(v.userId).toLowerCase() === cleanUserLower)) {
              updated = true;
              seenList.push({ userId: cleanUserLower, name: viewerName || cleanUserId, pfp: viewerPfp || "/cat.png", time: viewTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
            }
            return { ...(st.toObject ? st.toObject() : st), seenBy: seenList };
          }
          return st;
        });
        if (updated) await RoomProfile.findOneAndUpdate({ roomKey: roomKey, userId: cleanPartnerLower }, { statuses: newStatuses, updatedAt: new Date() });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "ADD_CALL_LOG" && callItem) {
      const existing = await RoomProfile.findOne({ roomKey: roomKey, userId: cleanUserLower });
      const logs = [callItem, ...(existing?.callLogs || [])].slice(0, 30);
      await RoomProfile.findOneAndUpdate({ roomKey: roomKey, userId: cleanUserLower }, { channel: cleanChannel, callLogs: logs, updatedAt: new Date() }, { upsert: true });
      return NextResponse.json({ success: true, callLogs: logs });
    }

    if (action === "DELETE_CALL_LOG" && callId) {
      const existing = await RoomProfile.findOne({ roomKey: roomKey, userId: cleanUserLower });
      const logs = (existing?.callLogs || []).filter((c) => String(c.id) !== String(callId));
      await RoomProfile.findOneAndUpdate({ roomKey: roomKey, userId: cleanUserLower }, { callLogs: logs, updatedAt: new Date() }, { upsert: true });
      return NextResponse.json({ success: true, callLogs: logs });
    }

    // =========================================================================
    // 2. HANDLE MESSAGE PIN / UNPIN / DELETE / REACT ACTIONS IN MONGODB
    // =========================================================================
    if (action && msgId) {
      let targetDoc = null;
      if (mongoose.Types.ObjectId.isValid(msgId)) {
        targetDoc = await Message.findById(msgId);
      }

      if (targetDoc) {
        if (action === "DELETE_ME") {
          const currentDeletedFor = Array.isArray(targetDoc.deletedFor) ? [...targetDoc.deletedFor] : [];
          if (!currentDeletedFor.includes(cleanUserLower)) currentDeletedFor.push(cleanUserLower);
          targetDoc.deletedFor = currentDeletedFor;
          await targetDoc.save();
        } else if (action === "DELETE_EVERYONE") {
          targetDoc.isDeleted = true;
          if (deletedEncryptedText) targetDoc.encryptedText = deletedEncryptedText;
          await targetDoc.save();
        } else if (action === "PIN") {
          targetDoc.isPinned = true;
          targetDoc.pinnedUntil = pinnedUntil ? new Date(pinnedUntil) : null;
          await targetDoc.save();
        } else if (action === "UNPIN") {
          targetDoc.isPinned = false;
          targetDoc.pinnedUntil = null;
          await targetDoc.save();
        } else if (action === "REACT") {
          // 🔥 Reactions saving to database properly
          const currentReactions = targetDoc.get('reactions') || {};
          if (emoji) {
            currentReactions[cleanUserLower] = emoji;
          } else {
            delete currentReactions[cleanUserLower];
          }
          await Message.findByIdAndUpdate(targetDoc._id, { $set: { reactions: currentReactions } });
        }
      }
      return NextResponse.json({ success: true });
    }

    // =========================================================================
    // 3. FETCH MESSAGES + MY PROFILE + PARTNER PROFILE FOR THIS CHATROOM
    // =========================================================================
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const minDate = roomCreatedAt && roomCreatedAt > sevenDaysAgo ? roomCreatedAt : sevenDaysAgo;

    const allMessages = await Message.find({}).sort({ createdAt: 1 });
    const nowDate = new Date();
    const visibleMessages = [];

    for (const msg of allMessages) {
      const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date(0);
      if (msgDate < minDate) continue;

      const sLower = String(msg.senderId || "").trim().toLowerCase();
      const rLower = String(msg.receiverId || "").trim().toLowerCase();
      const isUserMatch = cleanPartnerLower ? (sLower === cleanUserLower && rLower === cleanPartnerLower) || (sLower === cleanPartnerLower && rLower === cleanUserLower) : sLower === cleanUserLower || rLower === cleanUserLower;
      
      if (!isUserMatch) continue;

      const delForList = Array.isArray(msg.deletedFor) ? msg.deletedFor.map((u) => String(u).toLowerCase()) : [];
      if (delForList.includes(cleanUserLower)) continue;

      if (msg.isPinned && msg.pinnedUntil && new Date(msg.pinnedUntil) <= nowDate) {
        msg.isPinned = false;
        msg.pinnedUntil = null;
        await msg.save().catch(() => {});
      }
      visibleMessages.push(msg);
    }

    const nowMs = Date.now();
    const myProfDoc = await RoomProfile.findOne({ roomKey: roomKey, userId: cleanUserLower });
    const partnerProfDoc = cleanPartnerLower ? await RoomProfile.findOne({ roomKey: roomKey, userId: cleanPartnerLower }) : null;

    const cleanStatuses = async (profDoc) => {
      if (!profDoc || !Array.isArray(profDoc.statuses)) return [];
      const valid = profDoc.statuses.filter((s) => (nowMs - s.time) < TWENTY_FOUR_HOURS);
      if (valid.length !== profDoc.statuses.length) {
        profDoc.statuses = valid;
        await profDoc.save().catch(() => {});
      }
      return valid;
    };

    const myValidStatuses = await cleanStatuses(myProfDoc);
    const partnerValidStatuses = await cleanStatuses(partnerProfDoc);

    return NextResponse.json({
      success: true,
      roomKey: roomKey,
      messages: visibleMessages,
      myProfile: { profileImage: myProfDoc?.profileImage || "", statuses: myValidStatuses, callLogs: myProfDoc?.callLogs || [] },
      partnerProfile: { profileImage: partnerProfDoc?.profileImage || "", statuses: partnerValidStatuses }
    });
  } catch (error) {
    console.error("Fetch/Update Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}