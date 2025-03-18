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
import Hero from "~/components/layout/Hero"
import Tooltip from "~/components/layout/Tooltip"
import PoolProjects from "~/components/pools/PoolProjects"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
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
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
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
      <Hero
        backroungImageUrl={`/${type}.jpg`}
        title={type || "Pool"}
        //@ts-ignore
        description={type && poolDescriptions[value]}
        className="hover:scale-105 cursor-pointer"
        direction="vertical"
        button={<Donate poolNumber={value} />}
      >
        <p>
          Pool contains
          <span className="text-secondary">
            {pool ? ` ${formatEther(pool)} Eth` : ` 0 Eth`}
          </span>
        </p>
      </Hero>

      {type && <PoolProjects poolType={type} projects={projects} />}
    </div>
  )
}
