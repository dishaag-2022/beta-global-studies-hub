import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PushToken from "../../../models/PushToken";

export async function POST(req) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    }

    // Aage se target receiver ka exact ID aayega (hardcoded Student_A hat gaya)
    const { sender, receiver } = await req.json();
    const targetUser = receiver;

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Receiver not found" });
    }

    // Case-Insensitive search taaki space ya capital/small ka lafda na ho
    const targetData = await PushToken.findOne({ 
      username: new RegExp('^' + targetUser.trim() + '$', 'i') 
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
      return NextResponse.json({ success: true, message: "Ping sent successfully" });
    } else {
      return NextResponse.json({ success: false, error: "Target token not found in DB" });
    }

  } catch (error) {
    console.error("Push Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}