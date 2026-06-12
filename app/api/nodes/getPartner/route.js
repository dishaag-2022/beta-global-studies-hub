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

    // Aage-peeche ke spaces hata kar saaf karo aur case-insensitive regex banao
    const cleanUsername = username.trim();
    const usernameRegex = new RegExp('^' + cleanUsername + '$', 'i'); 

    // 1. Fix: Search for the room case-insensitively using regex
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

    // Helper function taaki lower/upper case match me dikkat na aaye
    const isMatch = (dbValue) => {
       return dbValue && dbValue.trim().toLowerCase() === cleanUsername.toLowerCase();
    };

    // 2. THE ULTIMATE FIX: Prioritize UID over Name!
    // Kyunki Push Token UID pe save hota hai, toh target bhi UID hona chahiye.
    let partnerId = "Unknown";

    if (isMatch(room.userA.uid) || isMatch(room.userA.name)) {
      // Tu User A hai, toh partner B ka UID nikal
      partnerId = room.userB.uid || room.userB.name; 
    } else {
      // Tu User B hai, toh partner A ka UID nikal
      partnerId = room.userA.uid || room.userA.name;
    }

    return NextResponse.json({ 
      success: true, 
      partner: partnerId, // Ye 'partnerId' exact Push Token se match karega!
      nodeName: room.channelName 
    });
    
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}