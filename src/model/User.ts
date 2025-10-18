import mongoose, {Schema, Document,Types} from "mongoose"

export interface Message extends Document{
    _id:Types.ObjectId;
    content: string;
    createdAt: Date
}

const MessageSchema:Schema<Message> = new Schema({
     content: {
        type: String,
        required: true
     },

     createdAt: {
        type: Date,
        required: true,
        default: Date.now()
     }
})

export interface User extends Document{
    username: string
    email: string
    password: string
    verifyCode: string
    verifyCodeExpiry: Date
    isVerified: boolean
    isAcceptingMessage: boolean
    messages: Message[]
}

const UserSchema:Schema<User> = new Schema({
     username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
     },

      email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please use a valid email address"]
        
      },

      password: {
        type: String,
        required: [true, "Password is required"]
      },
      verifyCode: {
        type: String,
        required: [true, "Verify code is required"]
      },

      verifyCodeExpiry: {
            type: Date,
            required: [true, "Verify code expiry is required"]
      },

      isVerified: {
        type: Boolean,
        default: false

      },

       isAcceptingMessage: {
        type: Boolean,
        default: true

      },

     messages: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel

/*
import mongoose, { Schema, Document } from "mongoose";
You're importing:

mongoose: The main library to interact with MongoDB.

Schema: A way to define the structure of your MongoDB documents.

Document: A TypeScript type that represents a document from MongoDB (helps with type checking).

🔹 Defining the Message Interface
ts
Copy
Edit
export interface Message extends Document {
    content: string;
    createdAt: Date;
}
This is a TypeScript interface that describes what a Message document looks like.

It extends Document so that Mongoose knows it's a MongoDB document.

Fields:

content: The actual message text.

createdAt: When the message was created.

🔹 Defining the MessageSchema
ts
Copy
Edit
const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
});
This is the Mongoose schema for a message.

content: Must be a string and is required.

createdAt: Must be a date, is required, and defaults to the current timestamp.

✅ This schema defines how individual feedback messages will be stored.

🔹 Defining the User Interface
ts
Copy
Edit
export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[];
}
This defines the structure of a User document.

Fields:

username, email, password: Self-explanatory.

verifyCode: A code sent via email to verify the user.

verifyCodeExpiry: When that code expires.

isVerified: Whether the user is verified.

isAcceptingMessage: If the user allows receiving feedback.

messages: An array of Message objects (as defined above).

🔹 Defining the UserSchema
ts
Copy
Edit
const UserSchema: Schema<User> = new Schema({
Defines the structure of a MongoDB User document using Mongoose.

🔸 username Field
ts
Copy
Edit
username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true
},
Must be a string.

Required with custom error message.

trim: Removes whitespace.

unique: No two users can have the same username.

🔸 email Field
ts
Copy
Edit
email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    match: [/^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please use a valid email address"]
},
Must be a string.

Required.

Must be unique.

Has a regex pattern to validate proper email format.

🔸 password Field
ts
Copy
Edit
password: {
    type: String,
    required: [true, "Password is required"]
},
Must be a string and required.

🔸 verifyCode and verifyCodeExpiry
ts
Copy
Edit
verifyCode: {
    type: String,
    required: [true, "Verify code is required"]
},

verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"]
},
Used for email verification.

Expiry ensures the code is only valid for a limited time.

🔸 isVerified and isAcceptingMessage
ts
Copy
Edit
isVerified: {
    type: Boolean,
    default: false
},

isAcceptingMessage: {
    type: Boolean,
    default: true
},
isVerified: Marks whether the user has completed verification.

isAcceptingMessage: Controls if others can send messages (i.e., anonymous feedback).

🔸 messages Field
ts
Copy
Edit
messages: [MessageSchema]
This is an array of messages (each must match MessageSchema).

Used to store all the feedback a user has received.

🔹 Creating the Model
ts
Copy
Edit
const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);
This line avoids model redefinition errors in development (common with hot-reloading in Next.js).

If User model exists, use it; else, create a new one from UserSchema.

🔹 Exporting the Model
ts
Copy
Edit
export default UserModel;
This allows you to import UserModel elsewhere to perform CRUD operations on users.

✅ Summary
This file defines:

A Message schema for feedback messages.

A User schema that includes user info, verification status, and messages.

A UserModel to interact with the users collection in MongoDB.

(mongoose.models.User as mongoose.Model<User>)
🔍 What is mongoose.Model<User>?
Model comes from the Mongoose library — it’s a class/interface that represents a MongoDB collection and gives you access to powerful methods like .find(), .create(), .updateOne(), etc.

When you do:

ts
Copy
Edit
import mongoose from "mongoose"
Mongoose exposes many types, including mongoose.Model.

mongoose.Model<User> is a TypeScript generic that says:

"This is a Mongoose Model whose documents match the User interface."

⚙️ Why use as mongoose.Model<User>?
Because mongoose.models.User is of type any or Model<any> by default (TypeScript doesn't know its structure), we cast it to the correct type:

ts
Copy
Edit
(mongoose.models.User as mongoose.Model<User>)
This tells TypeScript:

“Trust me, this is a Mongoose Model that returns documents of type User.”

Without this cast, TypeScript would give errors or not give you autocomplete for User fields.

📦 Where does Model come from?
Technically:

ts
Copy
Edit
mongoose.Model
is defined in the Mongoose type definitions like this:

ts
Copy
Edit
interface Model<T> extends NodeJS.EventEmitter {
  // lots of methods like:
  find(conditions: FilterQuery<T>): Query<T[]>;
  create(doc: T): Promise<T>;
  // ...
}
So when you do:

ts
Copy
Edit
mongoose.Model<User>
You're saying:

This is a model that represents documents of type User.

✅ Final Summary of the Line
ts
Copy
Edit
const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)
If the model is already defined (to avoid re-registering it), reuse it and tell TypeScript it's a Model<User>.

Otherwise, define a new model using the UserSchema.

Let me know if you want a visual diagram of how this fits into your app, or how UserModel is used in routes or API handlers.

*/

