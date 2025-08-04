import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { TextAnimate } from "@/components/magicui/text-animate";

export const Route = createFileRoute('/')({
  // beforeLoad: () => {
  //   // Redirect to /events and replace the current entry in history
  //   throw redirect({ to: '/events', replace: true })
  // },
  component: () => {
    return (
      <div className="hero bg-base-200 min-h-screen w-full flex justify-center items-center">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="">Hello there</h1>
            <h2>h2 Testing!</h2>
            <h3 className="py-7">h3 Testing!</h3>
            <h4>h4 Testing!</h4>
            <TextAnimate animation="slideLeft" by="character">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
              quasi. In deleniti eaque aut repudiandae et a id nisi.
            </TextAnimate>
            <Button >Get Started</Button>
          </div>
        </div>
      </div>
    )
  },
})