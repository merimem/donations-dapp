"use client"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { useLayoutEffect, useState } from "react"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import Donate from "@/components/layout/Donate"
import EthereumIcon from "@/components/layout/icons/EthereumIcon"
import Stats from "@/components/layout/Stat"
import Tooltip from "@/components/layout/Tooltip"
import PoolProjects from "@/components/pools/PoolProjects"
import config from "@/config/contract"
import { poolDescriptions, poolTitles } from "@/modules/pools/pools.constants"
import { PoolType } from "@/modules/pools/pools.typedefs"
import { UserType } from "@/modules/users/users.typedefs"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function Connect() {
  const router = useParams()
  const { type } = router
  const [userType, setUserType] = useState<string | null>()

  useLayoutEffect(() => {
    const userType = window.localStorage.getItem("userType")
    setUserType(userType)
  }, [])

  const value: number = PoolType[type as keyof typeof PoolType] ?? 0
  const { data: pool, refetch } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getPoolBalances",
    args: [value],
  })
  const { data: projects } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getAllProjects",
    args: [BigInt(0), BigInt(100)],
  })
  const mergedArray =
    projects &&
    projects[0].map((item, index) => {
      return {
        id: projects[0][index],
        ...projects[1][index],
      }
    })

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Link className="btn btn-soft btn-accent content" href="/pools">
          <ArrowLeftIcon className="w-4 h-4" />
          See all pools
        </Link>
        {userType === UserType.Owner && (
          <Tooltip dataTip="Create a new project in this pool">
            <Link
              className="btn btn-soft btn-warning content"
              href={`/project/new/${type}`}
            >
              Create project
            </Link>
          </Tooltip>
        )}
      </div>
      <div className="border bg-base-100 rounded p-4">
        <article className="grid place-items-center">
          <div className="mb-8 ">
            <h1
              className="text-3xl font-bold mb-4 glitch"
              data-text={type || "Pool"}
            >
              {type &&
                //@ts-ignore
                poolTitles[value]}
            </h1>
            <div className="flex justify-around mb-4">
              <img src={`/${type}.jpg`} className="h-64 w-64" />
              <Stats
                title="Pool balance"
                value={
                  <>
                    {pool ? ` ${formatEther(pool)}` : ` 0`}
                    <EthereumIcon isLight />
                  </>
                }
              />
            </div>
            <div className="flex justify-between pr-16 mb-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground max-w-[80%]">
                {type &&
                  //@ts-ignore
                  poolDescriptions[value]}
              </div>
            </div>

            <Donate poolNumber={value} />
          </div>
        </article>
      </div>
      {mergedArray && <PoolProjects poolType={value} projects={mergedArray} />}
    </div>
  )
}
