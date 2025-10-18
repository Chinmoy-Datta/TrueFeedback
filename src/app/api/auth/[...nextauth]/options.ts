import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import UserModel from "@/model/User";

import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "email or username", type: "text"},
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any):Promise<any>{
          await dbConnect()

          try {
            const user = await UserModel.findOne({
              $or: [
                {email:credentials.identifier},
                {username:credentials.identifier}
              ]
            })

            if(!user){
              throw new Error("No user found with this credential")
            }

            if(!user.isVerified){
              throw new Error("Please verify your account before login")
            }

            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)//password you can take directly from credentials.No need of identifier

            if(isPasswordCorrect){
              return user
            }
            
            else{
              throw new Error("Incorrect Password")

            }




          } 
          
          catch (error: any) {
            throw new Error(error)//it is required
          }
      }
    }),
  ],

  callbacks: {
      
    async jwt({ token, user }) {

      if(user){
        token._id = user._id?.toString()
        token.isVerified = user.isVerified
        token.isAcceptingMessages = user.isAcceptingMessages
        token.username = user.username
      }
      return token
    },



     async session({ session,token }) {
      if(token){
        session.user._id = token._id
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages = token.isAcceptingMessages
        session.user.username = token.username
      }
      return session
    },

  },

  pages: {
    signIn: "/sign-in" //You don't need to design this page.Next auth takes care of this

  },

  session: {
     strategy: "jwt"
  },

  secret:process.env.NEXTAUTH_SECRET
  
  
};

/*
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
✅ Good: Importing required modules.
🔧 Suggestion: If you’re using TypeScript strictly, you may want to define a type for your custom JWT & Session.

Providers
ts
Copy code
CredentialsProvider({
  id: "credentials",
  name: "Credentials",
  credentials: {
    email: { label: "email", type: "text"},
    password: { label: "Password", type: "password" },
  },
✅ Good: Setting up credentials.
⚠️ Issue: You’re only asking for email and password, but in your authorize function you’re checking credentials.identifier (not credentials.email).
So you should rename it properly:

ts
Copy code
credentials: {
  identifier: { label: "Email or Username", type: "text" },
  password: { label: "Password", type: "password" },
},
Then inside authorize, credentials.identifier makes sense.

Authorize function
ts
Copy code
async authorize(credentials: any):Promise<any>{
  await dbConnect()
  try {
    const user = await UserModel.findOne({
      $or: [
        {email:credentials.identifier},
        {username:credentials.identifier}
      ]
    })
✅ Good: Connecting to DB and checking both email & username.
🔧 Improvement: Instead of any, define a type:

ts
Copy code
interface Credentials {
  identifier: string;
  password: string;
}
And use authorize(credentials: Credentials | undefined).

ts
Copy code
if(!user){
  throw new Error("No user found with this email")
}
⚠️ Minor: If you’re allowing both username & email, then change the message to:
👉 "No user found with this email/username"

ts
Copy code
if(!user.isVerified){
  throw new Error("Please verify your account before login")
}
✅ Good: Prevents unverified logins.

ts
Copy code
const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

if(isPasswordCorrect){
  return user
} else {
  throw new Error("Incorrect Password")
}
✅ Correct password handling.
🔧 Small: You might want to return null instead of throw new Error() in case of invalid login. NextAuth will handle the error gracefully.

Callbacks
ts
Copy code
async jwt({ token, user }) {
  if(user){
    token._id = user._id?.toString()
    token.isVerified = user.isVerified
    token.isAcceptingMessages = user.isAcceptingMessages
    token.username = user.username
  }
  return token
},
✅ Perfect way to attach custom fields to JWT.

ts
Copy code
async session({ session, token }) {
  if(token){
    session.user._id = token._id
    session.user.isVerified = token.isVerified
    session.user.isAcceptingMessages = token.isAcceptingMessages
    session.user.username = token.username
  }
  return session
},
✅ Good.
🔧 Improvement: TypeScript will complain because session.user doesn’t have those extra fields by default. You need to extend NextAuth types in a next-auth.d.ts.

Other options
ts
Copy code
pages: {
  signIn: "/sign-in"
},
session: {
  strategy: "jwt"
},
secret: process.env.NEXTAUTH_SECRET
✅ Correct setup.
🔧 You can also add debug: process.env.NODE_ENV === "development" during dev to get better logs.

2. route.ts
ts
Copy code
import NextAuth from "next-auth";
import {authOptions} from "./options"

const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}
✅ Perfect — exactly how it should be in App Router.

✅ Final verdict
Your implementation is 90% correct.

Main fix: In credentials, change email → identifier since you’re checking both username/email.

Also, extend next-auth types so you don’t get red squiggly errors for token._id, session.user.username, etc.

*/
