import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
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

  const userId = user._id;

  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },

        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },

      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages");
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },

      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },

      { status: 401 }
    );
  }

  const userId = user?._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },

        { status: 404 }
      );
    }

    const isAcceptingMessage = foundUser.isAcceptingMessage;

    return Response.json(
      {
        success: true,
        message: "User status successfully retrieved",
        isAcceptingMessage,
      },

      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to get user acceptMessages status");
    return Response.json(
      {
        success: false,
        message: "Failed to get user acceptMessages status",
      },

      { status: 500 }
    );
  }
}

/*
getServerSession: Fetches the current session on the server (NextAuth).

authOptions: Your NextAuth configuration (providers, callbacks, etc.).

dbConnect: Ensures a connection to MongoDB (avoids multiple connections in dev).

UserModel: Mongoose model for your User collection.

User type: Importing type definition from NextAuth for TS safety.

export async function POST(request: Request) {
  await dbConnect();


This is the POST route (/api/accept-messages) that updates whether a user accepts messages.

dbConnect() ensures DB is connected before running queries.

  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }


Fetch the session → if no session, return 401 Unauthorized.

Casting session.user as User ensures TypeScript understands its shape.

  const userId = user._id;

  const { acceptMessages } = await request.json();


Extracts the userId from the session.

Extracts acceptMessages (boolean) from request body.

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );


Uses Mongoose’s findByIdAndUpdate to toggle isAcceptingMessage.

{ new: true } → returns updated document instead of the old one.

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "Failed to update user status to accept messages" },
        { status: 500 }
      );
    }


If the user doesn’t exist → return 500 error.

    return Response.json(
      { success: true, message: "Message acceptance status updated successfully", updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages");
    return Response.json(
      { success: false, message: "Failed to update user status to accept messages" },
      { status: 500 }
    );
  }
}


If successful → return updated user + success message.

If error → log + return 500.

GET route
export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }


Again → check authentication.

If no session → 401.

  const userId = user?._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }


Finds the user in DB by ID.

If not found → 404.

    const isAcceptingMessage = foundUser.isAcceptingMessage;

    return Response.json(
      { success: true, message: "User status successfully retrieved", isAcceptingMessage },
      { status: 200 }
    );


Extracts the isAcceptingMessage field.

Returns it with success response.

  } catch (error) {
    console.log("Failed to get user acceptMessages status");
    return Response.json(
      { success: false, message: "Failed to get user acceptMessages status" },
      { status: 500 }
    );
  }
}


Handles any DB errors.
*/
