import type { MetaFunction } from "@remix-run/node"
import Hero from "~/components/layout/Hero"
import flower from "../../public/hands.jpg"
import logo from "../../public/logo.png"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <Hero
          title="Empower Your Giving with Transparency and Control"
          description="Join a new era of humanitarian support where your donations are secure, traceable, and impactful. Track every step of your contribution, vote on fund releases, and ensure your money drives real change — all powered by blockchain technology."
          backroungImageUrl={flower}
          className="border-2 border-primary rounded-md shadow-lg shadow-indigo-500/50"
          button={
            <Link className="btn btn-soft btn-primary" to="/projects">
              Discover projects
            </Link>
          }
        />
        <nav className="flex flex-col  justify-center gap-4 rounded-3xl border border-gray-200 p-2 dark:border-gray-700">
          {/* <Hero
            title="What's Chain4Good ?"
            description="We are different from other !"
            backroungImageUrl={logo}
            className=""
            button={
              <Link className="btn btn-soft btn-primary" to="/projects">
                Discover projects
              </Link>
            }
          /> */}
        </nav>
      </div>
    </div>
  )
}
