"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import suggestedMessages from "../../../suggestedMessages.json";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useCompletion } from "@ai-sdk/react";
import { useRouter } from "next/navigation";

function Page() {
  const params = useParams<{ username: string }>();

  const [content, setContent] = useState("");

  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [isSuggestingMessages, setIsSuggestingMessages] = useState(false);

  const router = useRouter()

  const sendMessage = async () => {
    setIsSendingMessage(true);
    setContent("");

    try {
      const response = await axios.post("/api/send-message", {
        username: params.username,
        content: content,
      });

      console.log(response); // Todo: remove it after the test

      toast(response?.data.message);
    } catch (error) {
      console.error("Error in sending message");

      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError?.response?.data.message;
      toast(errorMessage || "Error in sending message")

    } finally {
      setIsSendingMessage(false);
    }
  };

  const { completion, complete, error } = useCompletion({
    api: "/api/suggest-messages",

    onFinish: (completion: string) => {},

    onError: (error) => {},

    streamProtocol: "text",
  });

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center px-6 py-12 text-white">
      {/* Heading */}
      <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-6">
        Share Your Thoughts Anonymously
      </h2>
      <p className="text-gray-400 text-center mb-12">
        Send feedback or suggestions to{" "}
        <span className="text-cyan-400">@{params.username}</span> — your
        identity stays hidden.
      </p>

      <div className="w-full max-w-3xl flex flex-col gap-10">
        {/* Send Message Section */}
        <section className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">
            Send a Message
          </h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full p-4 text-white bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none placeholder-gray-500"
            placeholder="Write your anonymous message here..."
          />
          <div className="flex justify-end mt-6">
            <Button
              onClick={sendMessage}
              disabled={isSendingMessage || content.trim() === ""}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl font-medium shadow-md transition"
            >
              {isSendingMessage ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </section>

        {/* Suggest Message Section (logic will be added later) */}
        <section className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <Button
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition"
            onClick={async () => {
              try {
                setIsSuggestingMessages(true);
                await complete("");
              } catch (error) {
                setIsSuggestingMessages(false);
                console.error("Error while suggesting Messages", error);
              }
            }}
          >
            Suggest Messages
          </Button>
          <p className="text-gray-400 mb-4 mt-4">
            Need inspiration? Pick from suggested messages to send quickly.
          </p>
          {/* You will add your suggest message logic here */}
          <div className="flex items-center justify-center text-gray-500 italic">
            <Card className="w-full max-w-xl bg-gray-800 border border-gray-700 text-white p-6 rounded-2xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-cyan-400">
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full min-h-[47px] bg-gray-900 text-gray-100 border border-gray-700 
                     text-left whitespace-pre-wrap break-words leading-relaxed p-4 rounded-xl 
                     transition-all duration-300 hover:-translate-y-1 
                     hover:bg-cyan-600 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  onClick={() =>
                    setContent(
                      isSuggestingMessages
                        ? completion.split("||")[0]
                        : suggestedMessages[0].suggestion
                    )
                  }
                >
                  {isSuggestingMessages
                    ? completion.split("||")[0]
                    : suggestedMessages[0].suggestion}
                </Button>
                <Button
                  variant="outline"
                  className="w-full min-h-[47px] bg-gray-900 text-gray-100 border border-gray-700 
                     text-left whitespace-pre-wrap break-words leading-relaxed p-4 rounded-xl 
                     transition-all duration-300 hover:-translate-y-1 
                     hover:bg-cyan-600 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]1"
                  onClick={() =>
                    setContent(
                      isSuggestingMessages
                        ? completion.split("||")[1]
                        : suggestedMessages[1].suggestion
                    )
                  }
                >
                  {isSuggestingMessages
                    ? completion.split("||")[1]
                    : suggestedMessages[1].suggestion}
                </Button>
                <Button
                  variant="outline"
                  className="w-full min-h-[47px] bg-gray-900 text-gray-100 border border-gray-700 
                     text-left whitespace-pre-wrap break-words leading-relaxed p-4 rounded-xl 
                     transition-all duration-300 hover:-translate-y-1 
                     hover:bg-cyan-600 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  onClick={() =>
                    setContent(
                      isSuggestingMessages
                        ? completion.split("||")[2]
                        : suggestedMessages[2].suggestion
                    )
                  }
                >
                  {isSuggestingMessages
                    ? completion.split("||")[2]
                    : suggestedMessages[2].suggestion}
                </Button>
              </CardContent>

              <CardFooter className="text-center mt-6 text-gray-400 text-sm">
                Tap any message to copy it into your input box.
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Create Account Section */}
        <section className="text-center">
          <p className="text-gray-400 mb-4">
            Want to receive anonymous feedback yourself?
          </p>
          <Button 
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition"
          
          onClick={()=> {
             router.replace("/sign-up")
          }}
          >
            Create Your Account
          </Button>
        </section>
      </div>
    </main>
  );
}

export default Page;
