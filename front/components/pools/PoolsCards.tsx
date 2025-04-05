"use client"
import { useAccount } from "wagmi"
import { PoolType } from "@/modules/pools/pools.typedefs"
import { ROUTES } from "@/utils/routes/routes.constants"
import Card from "../layout/Card"
import { useRouter } from "next/navigation"

interface PoolsCardsParams {}

const PoolsCards = ({}: PoolsCardsParams) => {
  const router = useRouter()
  const { isConnected } = useAccount()
  return (
    <>
      {isConnected ? (
        <>
          <h1 className="font-title relative z-2 mx-auto [transform:translate3d(0,0,0)] text-[clamp(2rem,6vw,4.5rem)] leading-none font-black will-change-auto motion-reduce:tracking-normal! max-[1279px]:tracking-normal!">
            {/* //font-bold flex justify-center text-xl mb-4 text-primary "> */}
            Active pools
          </h1>
          <p className="text-base-content/70 font-title py-4 font-light md:text-2xl">
            Our active pools hold dedicated funds to proactively prepare for and
            respond to disasters.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(PoolType)
              .filter((key) => isNaN(Number(key)))
              .map((key) => {
                return (
                  <Card
                    imageUrl={`${key}.jpg`}
                    title={key}
                    description={
                      <p className="">
                        {/* <span className="text-success">25$ </span> recolted */}
                      </p>
                    }
                    className="!rounded-none border border-[#00ff8c33]  hover:border-[#00ff8c99] hover:-translate-y-1 hover:shadow-[0_10px_20px_#00ff8c33] transition-all duration-300"
                    onClick={() => router.push(`${ROUTES.POOLS}/${key}`)}
                    key={key}
                  />
                )
              })}
          </div>
        </>
      ) : null}
    </>
  )
}

export default PoolsCards
