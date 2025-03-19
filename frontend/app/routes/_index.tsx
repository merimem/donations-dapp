import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import Hero from "~/components/layout/Hero"
import PoolsCards from "~/components/pools/PoolsCards"
import flower from "../../public/hands.jpg"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good" },
    { name: "description", content: "Welcome to Chain4Good!" },
  ]
}

export default function Index() {
  return (
    <nav className="flex flex-col gap-4 mby-4">
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
      <PoolsCards />
    </nav>
  )
}
