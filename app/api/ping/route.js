import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PushToken from "../../../models/PushToken"; // Path check kar lena apne hisaab se

export async function POST(req) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    }

    // 🔥 THE FIX: Function ke ANDAR req.json() se sab ek sath extract karna hai
    const { sender, receiver, channel, customMessage } = await req.json();
    const targetUser = receiver;

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Receiver not found" });
    }

    const targetData = await PushToken.findOne({ 
      username: new RegExp('^' + targetUser.trim() + '$', 'i') 
    });

   if (targetData && targetData.token) {
      const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: targetData.token,
          sound: 'default',
          title: "Global Studies Archive", 
          
          // 🔥 Custom message aayega toh wo dikhega, warna Decoy message!
          body: customMessage ? customMessage : "New course modules have been added to your syllabus.",
          
          priority: 'high', 
          channelId: 'default', 
        }),
      });

      const expoData = await expoRes.json();

      // Catch exact Expo error
      if (expoData.data && expoData.data.status === 'error') {
        return NextResponse.json({ success: false, error: `Expo Error: ${expoData.data.message}` });
      }

      return NextResponse.json({ success: true, message: "Ping sent successfully", receipt: expoData.data });
    } else {
      return NextResponse.json({ success: false, error: `Token for ${targetUser} not found in Database` });
    }

  } catch (error) {
    return NextResponse.json({ success: false, error: "Catch Error: " + error.message });
  }
}