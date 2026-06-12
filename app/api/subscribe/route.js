import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PushToken from "../../../models/PushToken";

export async function POST(req) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    }
    
    const { subscription, username } = await req.json();

    if (!subscription || !username) {
      return NextResponse.json({ success: false, error: "Missing data" });
    }

    const cleanUsername = username.trim();

    // Regex se strict search aur clean string save karo
    await PushToken.findOneAndUpdate(
      { username: new RegExp('^' + cleanUsername + '$', 'i') },
      { username: cleanUsername, token: subscription },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: "Token permanently saved to DB" });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" });
  }
}