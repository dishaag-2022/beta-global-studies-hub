import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PushToken from "../../../models/PushToken";

export async function POST(req) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    }

    // 🔥 THE FIX: Frontend se sender aur 'receiver' dono receive karo
    const { sender, receiver } = await req.json();
    
    if (!receiver) {
      return NextResponse.json({ success: false, error: "Receiver not found" });
    }

    // 🔥 THE FIX: Hardcoded logic hata kar direct receiver search maro
    // Trim aur RegExp isliye taaki spaces aur case-sensitive issue na aaye
    const targetData = await PushToken.findOne({ 
      username: new RegExp('^' + receiver.trim() + '$', 'i') 
    });

    if (targetData && targetData.token) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: targetData.token,
          sound: 'default',
          title: "Global Studies Hub",
          body: "New course modules have been added to your syllabus.",
          priority: 'high',
          channelId: 'default', 
        }),
      });
      return NextResponse.json({ success: true, message: `Ping sent successfully to ${receiver}` });
    } else {
      return NextResponse.json({ success: false, error: `Token not found for ${receiver}` });
    }

  } catch (error) {
    console.error("Push Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}