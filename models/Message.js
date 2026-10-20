// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  channel: { type: String, default: "" },
  roomKey: { type: String, default: "" },
  encryptedText: { type: String, required: true },
  timeStr: { type: String, default: "" },
  seenAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedFor: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  pinnedUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, expires: '7d' }
}, { strict: false });

// 🔥 PER-USER & PER-CHATROOM DATABASE PROFILE (PFP, STATUSES, CALL LOGS)
const roomProfileSchema = new mongoose.Schema({
  roomKey: { type: String, required: true, index: true },
  channel: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  profileImage: { type: String, default: "" },
  statuses: {
    type: [
      {
        id: { type: String, required: true },
        image: { type: String, required: true },
        text: { type: String, default: "" },
        time: { type: Number, required: true },
        seenBy: {
          type: [
            {
              userId: String,
              name: String,
              pfp: String,
              time: String
            }
          ],
          default: []
        }
      }
    ],
    default: []
  },
  callLogs: {
    type: [
      {
        id: Number,
        type: { type: String },
        isVideo: Boolean,
        time: String
      }
    ],
    default: []
  },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

if (mongoose.models.Message) delete mongoose.models.Message;
if (mongoose.models.RoomProfile) delete mongoose.models.RoomProfile;

export const RoomProfile = mongoose.model("RoomProfile", roomProfileSchema);
export default mongoose.model("Message", messageSchema);