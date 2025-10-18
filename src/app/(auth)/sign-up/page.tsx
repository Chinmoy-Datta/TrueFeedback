"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {Loader2} from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Page() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 500);

  const router = useRouter();

  //zod implementation

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage(""); //Reset Message

        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );

          //Todo: console.log(response)

          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data?.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      console.log(data)

      const response = await axios.post<ApiResponse>("/api/signup", data);

      console.log(response)

      toast("Success", {
        description: response.data.message,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });

      router.replace(`/verify/${username}`);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in signup of user", error);

      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage = axiosError.response?.data.message;

      toast("SignUp failed", {
        description: errorMessage,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });

      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-[0_0_15px_rgba(0,255,255,0.1)] border border-cyan-700/40 text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)]">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-cyan-400">
            Join True Feedback
          </h1>

          <p className="mb-4 text-gray-300">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="write username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);//debounced makes setUsername after 500 milliseconds and saves it.So in username value comes late
                      }}
                      className="bg-gray-900/60 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </FormControl>
                  <div className="flex items-center gap-2">
                        {isCheckingUsername && <Loader2
                    className="animate-spin text-cyan-400"/>}
                    <p className={`text-sm ${usernameMessage===
                      "Username is unique" ? "text-green-500": "text-red-500" //Just for Username is unique text will be green otherwise for all cases text will be red (including Zod validation like more than 2 characters etc)
                    }`}>
                       {usernameMessage}
                    </p>
                  
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                    className="bg-gray-900/60 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                      placeholder="email"
                    {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                    className="bg-gray-900/60 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                    type="password" 
                    placeholder="Password" 
                    {...field} 
                    
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-all duration-200" 
            type="submit"
            disabled={isSubmitting}
            >
              
              {
                isSubmitting ? (
                  <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
                  </>
                ): ("Signup")
              }
            
            </Button>

          </form>
        </Form>
        <div className="text-center mt-4">
              <p>
                Already a member?{' '}
                <Link href="/sign-in" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Sign in
                </Link>
              </p>

        </div>
      </div>
    </div>
  );
}

export default Page;
