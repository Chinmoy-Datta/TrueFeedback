"use client"

import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from "zod"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

function Signin() {

  const router = useRouter()

  const form = useForm<z.infer<typeof signInSchema>>({
     resolver: zodResolver(signInSchema),
     defaultValues: {
       identifier: "",
       password: ""
     },
  })

  const onSubmit = async(data:z.infer<typeof signInSchema>)=> {
    
   
     const response = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password
     })

      console.log(response)
 

     if(response?.error){
        toast.error("Signin failed", {
          description: response.error
        })
     }

     if(response?.url){
       router.replace("/dashboard")
     }
      
  }

  return (
     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
     
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-[0_0_15px_rgba(0,255,255,0.1)] border border-cyan-700/40 text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)]">
     
         <div className="text-center">
     
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                  Login into Your Account
               </h1>
     
                <p className="mb-4">Enter the credentials to login into your account</p>
     
         </div>
     
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <FormField
               control={form.control}
               name="identifier"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>identifier</FormLabel>
                   <FormControl>
                     <Input 
                     placeholder="Username or Email" 
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
                     type='password' 
                     placeholder="Password" 
                     {...field} 
                     
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
             <Button type="submit" className='w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-all duration-200'>
                   Login
              
              </Button>
           </form>
         </Form>
     
        </div>
     
       </div>
       

  )
}

export default Signin

