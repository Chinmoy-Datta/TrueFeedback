import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        _id?: string
        isVerified?: boolean
        isAcceptingMessages?: boolean
        username?: string
    }

    interface Session{

         user:{
               _id?: string
                isVerified?: boolean
                isAcceptingMessages?: boolean
                username?: string
         } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
                 _id?: string
                isVerified?: boolean
                isAcceptingMessages?: boolean
                username?: string
    }
}
/*
Explanation:
Yeah, that TypeScript error happens because NextAuth's default Token and Session types don’t have _id, isVerified, isAcceptingMessages, or username in their definitions.

By default:

token is typed as JWT which only knows about things like sub, email, name, picture.

session.user is typed as { name?: string; email?: string; image?: string }.

So when you try token._id = ... or session.user.username = ..., TypeScript complains because those keys don’t exist in the base type.

How to fix it

You need module augmentation to extend NextAuth types so TS knows these fields exist.

Create a new file:
types/next-auth.d.ts (or any .d.ts in your project that’s inside src so TS picks it up)

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }
}

Why this works

We’re telling TypeScript:

“Hey, my Session.user and JWT tokens have extra properties, don’t complain when I use them.”

Now, your code in callbacks will be valid:

callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token._id = user._id?.toString();
      token.isVerified = user.isVerified;
      token.isAcceptingMessages = user.isAcceptingMessages;
      token.username = user.username;
    }
    return token;
  },

  async session({ session, token }) {
    if (token) {
      session.user._id = token._id;
      session.user.isVerified = token.isVerified;
      session.user.isAcceptingMessages = token.isAcceptingMessages;
      session.user.username = token.username;
    }
    return session;
  },
},


If you want, I can also rewrite your authorize function so user returned already matches this extended type — then you won’t need unsafe any in your authorize. That will make your sign-in flow fully type-safe.

You said:
But one thing i want to tell you that i am getting red squiaales after token._id = user._id?.toString();
the equal sign that is in user not token 
ChatGPT said:

Ah, got it — if the red squiggly is on user._id and not on token._id, that means TypeScript doesn’t think user (the one coming from NextAuth’s jwt callback) has _id at all.

By default, in the jwt callback:

async jwt({ token, user }) { ... }


user is typed as User | AdapterUser, and both are minimal types with no _id, username, etc.

Even if you return a User from authorize, TS still thinks it’s the default type unless you augment it.

Why this happens

Your module augmentation for User is either:

Missing entirely

Or not being picked up because the .d.ts file is in the wrong place or missing declare module "next-auth"

How to fix for user._id

You need to extend the User type in next-auth so TypeScript knows user has _id, username, etc.

Here’s a minimal types/next-auth.d.ts that will fix both token and user issues:

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }
}

Important

Put this file in your src folder (e.g. src/types/next-auth.d.ts),
or somewhere included in your tsconfig.json under "include".

Restart your TypeScript server (VS Code → Command Palette → TypeScript: Restart TS Server).

If you want, I can rewrite your authorize function so that user is properly typed in there too, meaning no any and no guesswork.
That way token._id = user._id?.toString() will never complain again.

Do you want me to do that next?

You said:
Ok my question is that if the problem is in token like that:
token is typed as JWT which only knows about things like sub, email, name, picture.
SO why you are extending the User not the token
ChatGPT said:

Because in your specific case, the TypeScript error is on user._id — not on token._id.

Here’s how it works in the jwt callback:

async jwt({ token, user }) {
  if (user) {
    token._id = user._id?.toString(); // <--- user comes from authorize()
  }
}


token is typed as JWT — you’re right, that means only sub, name, email, picture by default.
→ If you get a red squiggly on token._id, that’s when you extend JWT.

user is typed as User | AdapterUser — by default, that only has id, name, email, image.
→ If you get a red squiggly on user._id, that’s when you extend User.

✅ So:

If TS complains about token._id → extend JWT.

If TS complains about user._id → extend User.

If you use session.user._id later → extend Session.user.

In your case, since the red squiggly is on user._id, you need to extend User.
But since you also later store _id on the token, you also need to **extend JWT** — otherwise you’ll hit the same issue later when accessing token._id`.

That’s why in my .d.ts example, I extended both User and JWT, plus Session.user, so all three are covered.

If you want, I can show you a before/after diagram of how these types flow from authorize() → jwt → session so you know exactly where to extend.
That will make the reason super obvious.

Want me to draw that?

You said:
Tell me you are doing some other approach to extent the jwt type.It is quite diff from the above two
ChatGPT said:

Yes — I usually take a “one central types file” approach rather than sprinkling User and JWT extensions separately in random places.

Here’s how my method differs:

Common approach (what most people do)

Extend User in one .d.ts file if TypeScript complains about user.something.

Extend JWT separately if TS complains about token.something.

Extend Session separately if TS complains about session.user.something.

This leads to multiple scattered type definitions that are easy to forget.

My approach (centralized augmentation)

I define all three extensions together in a single next-auth.d.ts file like this:

// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
  }

  interface Session {
    user: {
      _id: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
      username: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
  }
}

Why this is better

Single source of truth → You define all custom properties in one place.

Covers the full flow:
authorize() → user → jwt → token → session.user

Avoids "why is TS complaining here but not there?" moments.

💡
With this approach:

You always extend User, JWT, and Session together.

No need to remember “do I extend JWT or User?” — you extend both every time.

If you want, I can map out the exact data flow so you’ll know why _id needs to be on both User and JWT for your sign-in to work without TypeScript errors.
That would make the logic behind my approach crystal clear.

You said:
why jwt is outside
ChatGPT said:

It’s outside because JWT is not part of the "next-auth" module — it lives in a separate package/module:

declare module "next-auth/jwt" {
  interface JWT { ... }
}

Why?

When you install NextAuth, you actually get two sets of types:

next-auth → deals with User, Session, providers, callbacks, etc.

next-auth/jwt → deals only with the JWT object that flows in the jwt callback.

TypeScript treats these as two different declaration spaces, so you can’t extend JWT inside the "next-auth" module block — you must do it in "next-auth/jwt".

The flow

Here’s how the types line up in NextAuth’s lifecycle:

authorize() → returns User → 
jwt callback receives (token, user) →
token is typed as JWT (from next-auth/jwt) →
session callback receives (session, token) →
session.user gets token fields


So in your next-auth.d.ts:





That separation is required by how NextAuth publishes its type definitions.

If you want, I can show you your TrueFeedback type file rewritten cleanly so all your _id, isVerified, etc. work without TypeScript red squiggles. That would solve your token._id = user._id?.toString() issue completely.

You said:
can't i do this thing inside this:

declare module "next-auth"
ChatGPT said:

Nope — and this is exactly why you’re getting confused.

You cannot add custom fields to JWT inside declare module "next-auth" because:

The JWT type is not declared in "next-auth".

It’s declared in a different module: "next-auth/jwt".

TypeScript’s module augmentation works only if you augment the exact module where the type lives.

Think of it like this

If "next-auth" is one room and "next-auth/jwt" is another room,
you can’t rearrange furniture from the other room unless you go into that room.

So:

// For User & Session
declare module "next-auth" {
  interface User {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
  }

  interface Session {
    user: User;
  }
}

// For JWT
declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
  }
}


If you put JWT inside "next-auth",
TypeScript will ignore your changes because that’s not where JWT is defined.

That’s why your token._id = ... line is underlined —
TypeScript still thinks token only has the default fields (sub, email, name, picture).

I can rewrite your entire TrueFeedback auth type augmentation file so that all your token and session.user custom fields work without any red squiggles.
Would you like me to do that next?


*/