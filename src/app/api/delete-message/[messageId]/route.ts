import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Message } from "@/model/User";

export async function DELETE(request: Request, { params }: { params: { messageId: string }}){
   await dbConnect()

   const session = await getServerSession(authOptions)

   const user: User = session?.user as User

   if(!session || !session.user){
      return Response.json(
        {
            success: false,
            message: "User not Authenticated"
        },
        {
            status: 401
        }
      )
   }

   try {
    const messageId = params.messageId
 
    const dbUser = await UserModel.findById(user._id)

    if(!dbUser){
        return Response.json(
        {
          success: false,
          message: "No User exist with this id",
        },

        { status: 404 }
      );
    }
 
    dbUser.messages= dbUser?.messages.filter((message:Message)=> message._id.toString() !== messageId) 

    await dbUser.save()

       return Response.json(
      {
        success: true,
        message: "Message Deleted Successfully",
      },

      { status: 200 }
    );
  } 
 
   
   
   catch (error) {
        console.log("Failed to delete message");
    return Response.json(
      {
        success: false,
        message: "Failed to delete message",
      },

      { status: 500 }
    );
   }



}