"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import {toast} from "sonner"
import axios from "axios";

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId:string)=> void
}


function MessageCard({message, onMessageDelete}:MessageCardProps) {

   
  
    const handleDeleteConfirm = async()=> {
    const response = await axios.delete(`/api/delete-message/${message._id}`)
    toast(response.data.message)
    onMessageDelete(message._id.toString())
}
  return (
      <Card className="bg-gray-800 border border-gray-700 text-white shadow-md hover:shadow-[0_0_18px_rgba(34,211,238,0.3)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-cyan-400 break-words">
          {message.content}
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm mt-2">
          {new Date(message.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-500 text-white font-bold"
            >
              <X className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 text-white border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-cyan-400">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. It will permanently delete this
                message.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export default MessageCard;
