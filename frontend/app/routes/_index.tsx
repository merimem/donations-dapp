import type { MetaFunction } from "@remix-run/node"
// import Globe from "~/components/layout/Globe"
import PoolsCards from "~/components/pools/PoolsCards"
// import AfricaMap from "../../../public/AfricaMap.jpg"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good" },
    { name: "description", content: "Welcome to Chain4Good!" },
  ]
}

export default function Index() {
  return (
    <nav className="flex flex-col gap-4 mby-4">
      {/* <div className="relative w-[400px] h-[200px]"> */}
      <img src="/AfricaMap.jpg" />
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl">
        <p className="font-title relative z-2 mx-auto text-6xl leading-none font-black">
          Strengthening healthcare access
          <span className="text-xl">
            in West Africa through the power of donation.
          </span>
        </p>
      </div>
      {/* </div> * */}

      {/* <Hero
        title="Empower Your Giving with Transparency and Control"
        description="Join a new era of humanitarian support where your donations are secure, traceable, and impactful. Track every step of your contribution, vote on fund releases, and ensure your money drives real change — all powered by blockchain technology."
        backroungImageUrl={flower}
        className="border-2 border-primary rounded-md shadow-lg shadow-indigo-500/50"
        button={
          <Link className="btn btn-soft btn-primary" to="/projects">
            Discover projects
          </Link>
        }
      />*/}
      <PoolsCards />
    </nav>
  )
}
