import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb"; 
import Message from "../../../../models/Message";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  try {
    await connectToDatabase();
    const { id, channel } = await req.json();
    
    if (id) {
      await Message.findByIdAndUpdate(id, { $set: { seenAt: new Date() } }).catch(() => {});
    }
    
    await pusher.trigger(channel, "message_seen", { id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}