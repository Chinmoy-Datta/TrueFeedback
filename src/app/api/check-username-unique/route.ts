import dbConnect from "@/lib/dbConnect";

import UserModel from "@/model/User";

import {success, z} from "zod"

import {usernameValidation} from "@/schemas/signUpSchema"

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request:Request){ 

    await dbConnect()

    try {
       const {searchParams} = new URL(request.url)

       const queryParam = {
            username: searchParams.get("username")
       }

       //validate with zod

       const result = UsernameQuerySchema.safeParse(queryParam)

       console.log(result) // Todo: remove { success: true, data: { username: 'chinudatta' } }

      //  if(!result.success){
      //    const usernameErrors = result.error.format().
      //    username?._errors || [] //Todo: See the Deprecated format() thing and replace it 

      //    return Response.json({
      //      success: false,
      //      message: usernameErrors?.length > 0
      //      ? usernameErrors.join(", ")
      //      : "Invalid query parameters"
      //    },{status: 400})

      //  }

       if(!result.success){
        const tree = z.treeifyError(result.error)

        // console.log(tree)

        const usernameErrors = tree.properties?.username?.errors  || []

        // console.log(usernameErrors)
    
         return Response.json({
           success: false,
           message: usernameErrors?.length > 0
           ? usernameErrors.join(", ")
           : "Invalid query parameters"
         },{status: 400})
       }

       const {username} = result.data

       const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})

       if(existingVerifiedUser){
            return Response.json({
            success: false,
            message: "Username is already taken"
         },{status: 400})
       }

           return Response.json({
            success: true,
            message: "Username is unique"
         },{status: 200})




    } 
    
    catch (error) {
        console.error("Error checking username", error)

        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            
            {status: 500}
        )
    }
}
/*
Nice work 👌 You’re very close, but I see a couple of logic issues and improvements you should make in your check-username-unique route. Let’s go through them step by step:

🔎 Issues in your code
Error formatting from zod

const usernameErrors = result.error.format().username?._errors || []


This works, but can sometimes be tricky if format() changes shape.

Alternative: result.error.flatten().fieldErrors.username.

Redundant optional chaining

message: usernameErrors?.length > 0


You already defaulted to [].

No need for ?.length, plain usernameErrors.length works.

✅ Corrected version
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const queryParam = {
      username: searchParams.get("username"),
    };

    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors =
        result.error.flatten().fieldErrors.username || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 409 } // 409 Conflict is more precise than 400
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username", error);

    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}

📌 Improvements Made

✅ Changed username taken response → 409 Conflict (more meaningful).

✅ Used error.flatten() instead of error.format() (cleaner & safer).

✅ Simplified optional chaining in error handling.

👉 Do you want me to also show you how to consume this route from your frontend (React / Next.js) with debounce (so it doesn’t spam the server on every keystroke)?

You said:
can i use request.nextUrl.searchParams in place of this line below:
       const {searchParams} = new URL(request.url)
ChatGPT said:

Yes 👍 you can! Since you’re inside a Next.js Route Handler (App Router), the request object is an instance of NextRequest (not the plain Request).

That means you get a few extra goodies like .nextUrl.

So instead of:

const { searchParams } = new URL(request.url);


You can write:

const searchParams = request.nextUrl.searchParams;

Difference

new URL(request.url) → works everywhere (standard Web API).

request.nextUrl.searchParams → Next.js specific, only available in route handlers (gives you a parsed NextURL object).

Both are valid, but if you’re in Next.js App Router, request.nextUrl.searchParams is cleaner and slightly more efficient since Next.js has already parsed it. 🚀

👉 Do you want me to rewrite your whole check-username-unique route using request.nextUrl.searchParams for clarity?

You said:
Ya go ahead
ChatGPT said:

Perfect 🚀 Here’s your check-username-unique route rewritten using request.nextUrl.searchParams instead of creating a new URL object:

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    // ✅ Use Next.js helper
    const searchParams = (request as any).nextUrl.searchParams;
    const queryParam = { username: searchParams.get("username") };

    // ✅ Validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 } // ✅ fixed: success should return 200 not 400
    );
  } catch (error) {
    console.error("Error checking username", error);

    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}

🔑 Improvements made

Used request.nextUrl.searchParams instead of new URL(request.url).

Fixed success response status code → should be 200, not 400.

Slightly cleaned up the formatting.
*/