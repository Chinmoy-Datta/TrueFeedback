import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: any) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ success: false, message: "User not Authenticated" }, { status: 401 });
  }

  const user = session.user;

  try {
    const messageId = context.params.messageId;

    const dbUser = await UserModel.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "No User exist with this id" }, { status: 404 });
    }

    dbUser.messages = dbUser.messages.filter(
      (message: Message) => message._id.toString() !== messageId
    );

    await dbUser.save();

    return NextResponse.json({ success: true, message: "Message Deleted Successfully" }, { status: 200 });
  } catch (error) {
    console.log("Failed to delete message", error);
    return NextResponse.json({ success: false, message: "Failed to delete message" }, { status: 500 });
  }
}
