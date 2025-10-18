import dbConnect from "@/lib/dbConnect";

import UserModel from "@/model/User";

import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request){
    await dbConnect()

    try {
       const {username, email, password} = await request.json()

       const existingUserVerifiedByUsername = await UserModel.findOne({
         username,
         isVerified: true // works as a and operation sees both the condition is true
       })

       if(existingUserVerifiedByUsername){
          return Response.json({
            success: false,
            message: "Username is already taken"
          }, {status: 400})
       }

       const existingUserByEmail = await UserModel.findOne({email})

       const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

       if(existingUserByEmail){
        
         if(existingUserByEmail.isVerified){
           return Response.json({
              success: false,
              message: "User already exist with this email"

           }, {status: 400})
         }

         else{
          const hashedPassword = await bcrypt.hash(password, 10) // suppose  user has given a new password. we need to hash it

          existingUserByEmail.password = hashedPassword

          existingUserByEmail.verifyCode = verifyCode

          existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

          await existingUserByEmail.save()



         }


       }

       else{

        const hashedPassword = await bcrypt.hash(password, 10)

        const expiryDate = new Date()

        expiryDate.setHours(expiryDate.getHours() + 1)
        
        const newUser =  new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages:[]
        })

        await newUser.save()
       }
       //send verification email

      const emailResponse = await sendVerificationEmail(email, username, verifyCode)

      if(!emailResponse.success){
        return Response.json({
          success: false,
          message: emailResponse.message

        }, {status: 500})
      }

         return Response.json({
          success:true,
          
          message:"User registered successfully.Please verify your email"

        }, {status: 201})

    } 
    
    catch (error) {
       console.error("Error registering user", error)//Error shown in console
       return Response.json(
        {
            success: false,
            message: "Error registering user"//Error shows in frontend
        },
        {
            status:500
        }
       ) 
    }
}

/*
Nice — I’ll walk through your improved signup route line by line, explaining what each statement does and why it’s there. I’ll group a few trivial import lines together to keep this readable, but otherwise I’ll follow the code flow exactly.

Line-by-line explanation
ts
Copy
Edit
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
dbConnect: your helper that opens/ensures a Mongoose connection to MongoDB. Calling this ensures the DB is ready before queries.

UserModel: the Mongoose model for the User collection (schema you defined earlier).

bcrypt: library used to hash passwords (bcrypt.hash and friends).

sendVerificationEmail: helper function that sends the verification email (returns an ApiResponse style object).

ApiResponse: TypeScript type for the shape of responses returned by sendVerificationEmail (usually { success: boolean, message: string }).

ts
Copy
Edit
export async function POST(request: Request) {
Exports an async handler for POST requests (Next.js app-router style). request is the incoming HTTP request object.

ts
Copy
Edit
  await dbConnect();
Ensures a DB connection is established before doing any queries. If dbConnect() throws, the function will exit to the catch block.

ts
Copy
Edit
  try {
Start of the try block to catch and handle runtime errors that may occur during registration steps.

ts
Copy
Edit
    const { username, email, password } = await request.json();
Parses JSON body of the request and extracts username, email, and password provided by the client.

ts
Copy
Edit
    // Basic validation
    if (!username || !email || !password) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }
Simple server-side validation to ensure required fields are present.

If any are missing, immediately return an HTTP 400 (Bad Request) JSON response.

Response.json(...) builds a JSON HTTP response (Next.js provides helpful global response utilities).

ts
Copy
Edit
    // Check if verified username already exists
    const usernameTaken = await UserModel.findOne({
      username,
      isVerified: true,
    });
Query the DB to find a verified user with the same username.

You want usernames to be unique among users who are already verified (so an unverified user won’t block the username until they verify).

ts
Copy
Edit
    if (usernameTaken) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 400 }
      );
    }
If a verified user with the same username exists, we stop and return 400 with an explanatory message.

ts
Copy
Edit
    // Check if email exists
    let user = await UserModel.findOne({ email });
Try to find any user record for the provided email (could be verified or unverified). We store it in user (declared let because we may reassign later).

ts
Copy
Edit
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
Generates a 6-digit verification code between 100000 and 999999. .toString() converts it to a string for storage and email.

This is OK for demos; for high-security production consider crypto.randomInt(...).

ts
Copy
Edit
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
Calculates the expiry time for the verification code: current time + 3,600,000 ms (1 hour).

Save this to check later whether the code is still valid.

ts
Copy
Edit
    if (user) {
If a user with the email already exists, handle the two possible cases next.

ts
Copy
Edit
      if (user.isVerified) {
        return Response.json(
          { success: false, message: "User already exists with this email" },
          { status: 400 }
        );
      }
If the existing user is already verified, block registration and return 400 (email already in use).

ts
Copy
Edit
      // Update unverified user
      user.password = await bcrypt.hash(password, 10);
      user.verifyCode = verifyCode;
      user.verifyCodeExpiry = verifyCodeExpiry;
      await user.save();
Else (user exists but is not verified):

Hash the new password with bcrypt.hash(password, 10) and assign it.

Update verifyCode and verifyCodeExpiry with the newly generated code and expiry.

await user.save() persists changes to the DB.

This flow lets an unverified user re-register / change password and get a fresh verification code.

ts
Copy
Edit
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await user.save();
    }
If no user with that email exists:

Hash the password once.

Create a new UserModel document with provided data and sensible defaults:

isVerified: false (user must verify).

isAcceptingMessage: true (default to accept feedback).

messages: [] (empty array).

Save the new user to the DB.

ts
Copy
Edit
    // Send verification email
    const emailResponse: ApiResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
Calls your email helper to send the verification email.

The helper returns an object matching ApiResponse, e.g. { success: true, message: "..." }.

ts
Copy
Edit
    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }
If sending the email failed, return a 500 (server error) with the helper’s error message.

Note: at this point the DB already contains the new/updated user with the code — the client can retry sending email or you can implement retries.

ts
Copy
Edit
    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      { status: 201 }
    );
If everything succeeded (DB updated/created and email sent), respond with 201 (Created) and a success message.

ts
Copy
Edit
  } catch (error) {
    console.error("Error registering user:", error);
    return Response.json(
      { success: false, message: "Error registering user" },
      { status: 500 }
    );
  }
}
Catch block for any unexpected runtime errors (DB failures, unhandled rejections, etc).

Logs the error to the server console for debugging and returns a 500 to the client.

Quick notes / small caveats
bcrypt.hash(password, 10): 10 is the salt rounds — OK for dev/portfolio. It affects CPU cost; higher is more secure but slower.

OTP randomness: Math.random() is okay for demos; prefer crypto.randomInt for production if you need stronger unpredictability.

You currently update DB before sending the email. If sending fails, DB still contains the code — fine for a demo, but you might want to implement a retry or rollback strategy in production.

You rely on Response.json(...) helper — in Next.js App Router this is acceptable; if using a different environment you may use NextResponse.json(...) or new Response(...).

Consider adding unique indexes on email and username at the DB schema level to avoid race conditions where two requests try to create same email/username concurrently.
*/