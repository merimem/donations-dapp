import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import {
  Link,
  MetaFunction,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import Donate from "~/components/layout/Donate"
import EthereumIcon from "~/components/layout/icons/EthereumIcon"
import Stats from "~/components/layout/Stat"
import Tooltip from "~/components/layout/Tooltip"
import PoolProjects from "~/components/pools/PoolProjects"
import config from "~/config/contract"
import { poolDescriptions } from "~/modules/pools/pools.constants"
import { PoolType } from "~/modules/pools/pools.typedefs"
import { getAllProjects } from "~/modules/projects/project.server"
import { Project } from "~/modules/projects/project.typedefs"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good pools" },
    { name: "description", content: "Connection" },
  ]
}

type LoaderData = {
  projects: Project[]
}

export const loader = async () => {
  const projects = await getAllProjects()

  return { projects }
}

export default function Connect() {
  const { projects } = useLoaderData() as LoaderData
  const params = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { type } = params
  if (!type || !(type in PoolType)) {
    navigate("/")
  }
  const value: number = PoolType[type as keyof typeof PoolType] ?? 0
  const { data: pool, refetch } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getPoolBalances",
    args: [value],
  })

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Link className="btn btn-soft btn-accent content" to="/pools">
          <ArrowLeftIcon className="w-4 h-4" />
          See all pools
        </Link>
        <Tooltip dataTip="Create a new project in this pool">
          <Link
            className="btn btn-soft btn-warning content"
            to={`/projects/new/${type}`}
          >
            Create project
          </Link>
        </Tooltip>
      </div>
      <div className="border bg-base-100 rounded p-4">
        <article>
          <div className="mb-8">
            <img src={`/${type}.jpg`} className="h-64 w-full" />
            <h1
              className="text-3xl font-bold mb-4 glitch"
              data-text={type || "Pool"}
            >
              {type || "Pool"}
            </h1>
            <div className="flex justify-between pr-16">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {type &&
                  //@ts-ignore
                  poolDescriptions[value]}
              </div>

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

            <Donate poolNumber={value} />
          </div>
        </article>
      </div>
      {type && <PoolProjects poolType={type} projects={projects} />}
    </div>
  )
}
