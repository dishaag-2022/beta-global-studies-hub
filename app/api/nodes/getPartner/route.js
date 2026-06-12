import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Room from "../../../../models/Room";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ success: false, error: "Username required" });
    }

    const cleanUsername = username.trim();
    const usernameRegex = new RegExp('^' + cleanUsername + '$', 'i'); 

    const room = await Room.findOne({
       $or: [
         { "userA.uid": usernameRegex },
         { "userA.name": usernameRegex },
         { "userB.uid": usernameRegex },
         { "userB.name": usernameRegex }
       ]
    });

    if (!room) {
      return NextResponse.json({ success: false, error: "Node not found" });
    }

    const isMatch = (dbValue) => {
       return dbValue && dbValue.trim().toLowerCase() === cleanUsername.toLowerCase();
    };

    let partnerId = "Unknown";

    // NAME KI JAGAH UID RETURN KAREGA TAAKI TOKENS MATCH HO JAYEIN
    if (isMatch(room.userA.uid) || isMatch(room.userA.name)) {
      partnerId = room.userB.uid || room.userB.name; 
    } else {
      partnerId = room.userA.uid || room.userA.name;
    }

    return NextResponse.json({ 
      success: true, 
      partner: partnerId, 
      nodeName: room.channelName 
    });
    
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}