import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { Link, MetaFunction, useNavigate, useParams } from "@remix-run/react"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import Donate from "~/components/layout/Donate"
import Hero from "~/components/layout/Hero"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import { poolDescriptions } from "~/modules/pools/pools.constants"
import { PoolType } from "~/modules/pools/pools.typedefs"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good pools" },
    { name: "description", content: "Connection" },
  ]
}

export default function Connect() {
  const params = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { type } = params
  if (!type || !(type in PoolType)) {
    navigate("/")
  }
  const value: bigint = type ? PoolType[type] : 0
  const { data: pool, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getPoolBalances",
    args: [value],
  })

  return (
    <div>
      <Link className="btn btn-soft btn-accent content" to="/pools">
        <ArrowLeftIcon className="w-4 h-4" />
        See all pools
      </Link>
      <Hero
        backroungImageUrl={`/${type}.jpg`}
        title={type || "Pool"}
        //@ts-ignore
        description={type && poolDescriptions[value]}
        className="hover:scale-105 cursor-pointer"
        direction="vertical"
        // onClick={() => navigate(`${ROUTES.POOLS}/${key}`)}
        button={<Donate poolNumber={value} />}
      >
        <p>
          Pool contains{" "}
          <span className="text-secondary">
            {pool ? `${formatEther(pool)} Eth` : undefined}
          </span>
        </p>
      </Hero>
    </div>
  )
}
