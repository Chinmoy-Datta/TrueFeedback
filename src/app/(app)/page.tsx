"use client"
import React from "react"
import messages from "../../messages.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function Page() {
  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-20 py-16 
        bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-gray-100 relative overflow-hidden">

        {/* Hero Section */}
        <section className="text-center mb-12 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
            Share Your Thoughts Freely
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            True Feedback — Your safe space for anonymous, honest, and impactful feedback.
          </p>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 2500 })]}
          className="w-full max-w-lg md:max-w-2xl relative z-10"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="bg-gray-800/60 backdrop-blur-md border border-gray-700 shadow-lg 
                  hover:shadow-cyan-500/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-gray-200">{message.content}</p>
                      <p className="text-xs text-gray-400">{message.received}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Accordion Section */}
        <section className="mt-16 w-full max-w-3xl relative z-10">
          <h2 className="text-center text-2xl md:text-3xl font-semibold mb-8 text-emerald-400">
            Learn More
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
                Why Anonymous?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Anonymity allows people to share their honest thoughts without
                fear of judgment, leading to genuine and impactful feedback.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
                How do I share my profile link?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                    After signing up, go to your dashboard to copy your unique
        profile URL. Share it anywhere so others can leave you
        anonymous feedback
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
                   Can I turn off messages temporarily?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
               Absolutely. Use the “Accept Messages” switch in your dashboard.
        Turning it off prevents new submissions until you enable it
        again.
              </AccordionContent>
            </AccordionItem>
                 <AccordionItem value="item-4">
              <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
                   How do I delete or manage messages?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
          From your dashboard, you can view and delete messages.
        Once deleted, they’re permanently removed.
              </AccordionContent>
            </AccordionItem>

                     <AccordionItem value="item-5">
              <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
                   What if I receive abusive content?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
          You can delete abusive messages instantly. For repeated
        abuse, disable messages or report the issue to support
        (coming soon).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 bg-gray-950 text-gray-400 border-t border-gray-800">
        © {new Date().getFullYear()} True Feedback. Built with ❤️ for open conversations.
      </footer>
    </>
  )
}

export default Page
