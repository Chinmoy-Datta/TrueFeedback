import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },

      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },

      { $unwind: "$messages" },

      { $sort: { "messages.createdAt": -1 } },

      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" }, // collect messages into an array
        },
      },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No Messages Yet",
        },

        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },

      { status: 200 }
    );
  } 
  
  catch (error) {

     console.log("Failed to get user messages");
    return Response.json(
      {
        success: false,
        message: "Failed to get user messages",
      },

      { status: 500 }
    );
  }
}

/*
Suppose your users collection has a document like this:
{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": [
    { "text": "Hello", "createdAt": "2025-08-10T10:00:00Z" },
    { "text": "How are you?", "createdAt": "2025-08-12T09:00:00Z" },
    { "text": "Bye", "createdAt": "2025-08-11T15:00:00Z" }
  ]
}

1. $match: { _id: userId }

Filters documents so you only process Alice’s document.

👉 Input to next stage:

{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": [
    { "text": "Hello", "createdAt": "2025-08-10T10:00:00Z" },
    { "text": "How are you?", "createdAt": "2025-08-12T09:00:00Z" },
    { "text": "Bye", "createdAt": "2025-08-11T15:00:00Z" }
  ]
}

2. $unwind: "$messages"

This deconstructs the array messages into separate documents (one per message).

👉 Output (3 documents now):

{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": { "text": "Hello", "createdAt": "2025-08-10T10:00:00Z" }
}
{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": { "text": "How are you?", "createdAt": "2025-08-12T09:00:00Z" }
}
{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": { "text": "Bye", "createdAt": "2025-08-11T15:00:00Z" }
}

3. $sort: { "messages.createdAt": -1 }

Now that every message is its own document, you can sort them individually by createdAt.

👉 Sorted output:

{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": { "text": "How are you?", "createdAt": "2025-08-12T09:00:00Z" }
}
{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": { "text": "Bye", "createdAt": "2025-08-11T15:00:00Z" }
}
{
  "_id": ObjectId("64f2..."),
  "name": "Alice",
  "messages": { "text": "Hello", "createdAt": "2025-08-10T10:00:00Z" }
}

4. $group

Now we put all the messages back into an array, but this time they’re sorted.

{
  $group: {
    _id: "$_id",
    messages: { $push: "$messages" }
  }
}


👉 Final result:

{
  "_id": ObjectId("64f2..."),
  "messages": [
    { "text": "How are you?", "createdAt": "2025-08-12T09:00:00Z" },
    { "text": "Bye", "createdAt": "2025-08-11T15:00:00Z" },
    { "text": "Hello", "createdAt": "2025-08-10T10:00:00Z" }
  ]
}


✅ So what happened overall?

Start with Alice’s user document.

Break apart her messages array into individual docs.

Sort those docs by createdAt (descending).

Group them back together into a single messages array, now sorted.
*/
