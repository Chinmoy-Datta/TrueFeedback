"use client";
import { useCallback, useEffect, useState } from "react";
import { Message } from "@/model/User";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import MessageCard from "@/components/MessageCard";
import { User } from "next-auth";

function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(
      messages.filter(
        (message: Message) => message._id.toString() !== messageId
      )
    );
  };

  const { data: session } = useSession();

  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");

      console.log(response); //Todo: Remove it after use

      setValue("acceptMessages", response.data.isAcceptingMessage ?? false); // it will set the value of the switch in the ui
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast("Error", {
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message settings",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        console.log(response); //Todo: Remove it after use
        setMessages(response.data.messages || []);
        if (refresh) {
          toast("Refreshed Messages", {
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        toast("Error", {
          description:
            axiosError.response?.data.message || "Failed to load messages",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  //handle switch change

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast("Error", {
        description:
          axiosError.response?.data.message ||
          "Failed to change the state of the switch",
      });
    }
  };

  const user: User = session?.user as User;

  const username = user?.username;

  //Todo: Do more research

  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast("URL copied", {
      description: "Profile url has been copied to clipboard",
    });
  };

  if (!session || !session.user) {
    return (
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-8 bg-gray-900 text-white rounded-2xl w-full max-w-6xl shadow-[0_0_25px_rgba(34,211,238,0.15)] border border-gray-800">
        Please login
      </div>
    );
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-8 bg-gray-900 text-white rounded-2xl w-full max-w-6xl shadow-[0_0_25px_rgba(34,211,238,0.15)] border border-gray-800">
      <h1 className="text-4xl font-bold mb-6 text-cyan-400">User Dashboard</h1>
      {/* Copy Link Section */}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-200">
          Copy Your Unique Link
        </h2>{" "}
        <div className="flex items-center bg-gray-800 rounded-lg p-2 border border-gray-700">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="bg-gray-800 text-gray-300 w-full p-2 rounded-lg outline-none"
          />
          <Button
            onClick={copyToClipboard}
            className="ml-2 bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            Copy
          </Button>
        </div>
      </div>
      {/* Accept Messages Switch */}
      <div className="flex items-center mb-6">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2 text-gray-300">
          Accept Messages:{" "}
          <span className={acceptMessages ? "text-green-400" : "text-red-400"}>
            {acceptMessages ? "On" : "Off"}
          </span>
        </span>
      </div>
      <Separator className="bg-gray-700 mb-6" />
      {/* Refresh Button */}

      <Button
        className="bg-gray-800 hover:bg-cyan-600 text-white border border-gray-700 transition-all duration-300"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" /> //This icon will be seen when isLoading is false but when you click into this button isLoading becomes true and loader icon will be rendered.
        )}
        {isLoading ? "Loading..." : "Refresh"}
      </Button>

      {/*Message Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-400 italic">No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
/*
Good question 👍 — let’s untangle this.

🟢 Where does acceptMessages come from?

It doesn’t exist in your state by default.

It comes from React Hook Form’s internal state.

When you call:

const { register, setValue, watch } = useForm();


register("acceptMessages") tells RHF:

“I have a field called acceptMessages. Keep track of its value internally.”

watch("acceptMessages") then looks into RHF’s state and gives you whatever it currently holds.

At first → it’s undefined (because no defaultValue was set).
After your API call → you do:

setValue("acceptMessages", response.data.isAcceptingMessage);


Now RHF’s state has { acceptMessages: true/false }.
From then on, watch("acceptMessages") gives the live value.

🟢 Is this correct?

Yes ✅ — it works fine because you always set the value after fetching from the backend.

The “no default value” approach means:

While waiting for the API → acceptMessages is undefined.

After API response → setValue ensures it becomes true or false.

That’s why TypeScript complains (boolean | undefined), but at runtime it’s okay.

🟡 What your instructor probably meant

He’s okay skipping defaultValues because he knows the API will always set it before the user interacts.
But TypeScript doesn’t “trust” that — so it forces you to handle the undefined case.

✅ So:

acceptMessages comes from watch("acceptMessages"), which reads React Hook Form’s state.

It’s correct logically, but for TypeScript safety, you either:

Give a defaultValue, or

Use ?? false to guard against undefined.

Do you want me to show you how the flow looks step by step in runtime (like a timeline: before fetch → after fetch → user toggles)? That might make it crystal clear.

You said:
Ya go for it
ChatGPT said:

Perfect 👌 let’s walk through the runtime timeline of how acceptMessages flows in your app.

🔄 Timeline of acceptMessages
1. Form Initialization
const form = useForm<z.infer<typeof acceptMessageSchema>>({
  resolver: zodResolver(acceptMessageSchema),
});
const { register, setValue, watch } = form;
const acceptMessages = watch("acceptMessages");


useForm() sets up an empty form state (since you didn’t provide defaultValues).

So right now:

form state = {}
acceptMessages = undefined

2. UI Render

You render the Switch:

<Switch
  {...register("acceptMessages")}
  checked={acceptMessages}
  onCheckedChange={handleSwitchChange}
/>


At this point:

checked={acceptMessages} → equals undefined.

The Switch might behave like it’s false by default, until we set it.

3. API Call to Get User Settings

You call the backend:

const response = await axios.get<ApiResponse>("/api/accept-messages");
setValue("acceptMessages", response.data.isAcceptingMessage);


Suppose the backend returns:

{
  "success": true,
  "message": "User status successfully retrieved",
  "isAcceptingMessage": true
}


Now RHF’s state becomes:

form state = { acceptMessages: true }
acceptMessages = true


React re-renders → Switch now shows ON.

4. User Toggles the Switch

User clicks → onCheckedChange runs:

const handleSwitchChange = async () => {
  const response = await axios.post("/api/accept-messages", {
    acceptMessages: !acceptMessages,
  });
  setValue("acceptMessages", !acceptMessages);
};


If current acceptMessages = true, then !acceptMessages = false.

Backend updates the DB (isAcceptingMessage: false).

setValue("acceptMessages", false) updates RHF’s state.

Now:

form state = { acceptMessages: false }
acceptMessages = false


React re-renders → Switch now shows OFF.

5. Consistency Between Frontend & Backend

From now on:

Backend always stores the truth (isAcceptingMessage).

Frontend always syncs its form state with backend’s value via setValue and watch.

✅ That’s the whole lifecycle:

Starts undefined.

API fills it in (true/false).

Switch toggles update both backend and form state.

Watch keeps your UI in sync.
*/
