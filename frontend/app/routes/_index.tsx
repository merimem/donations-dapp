import type { MetaFunction } from "@remix-run/node"
import Hero from "~/components/layout/Hero"
import flower from "../../public/hands.jpg"
import logo from "../../public/logo.png"
import { Link } from "@remix-run/react"
import { useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "~/config/contract"
import PoolsCards from "~/components/pools/PoolsCards"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
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
