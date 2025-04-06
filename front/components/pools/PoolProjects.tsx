import { ROUTES } from "@/utils/routes/routes.constants"
import Link from "next/link"
import Card from "../layout/Card"
import { formatEther } from "viem"
import EthereumIcon from "../layout/icons/EthereumIcon"

interface PoolProjectsProps {
  poolType: number
  projects: any[]
}

const PoolProjects = ({ poolType, projects }: PoolProjectsProps) => {
  console.log("projects", projects)
  const poolProjects = projects.filter(
    (project) => project.poolType === poolType
  )

  return (
    <div className="p-6 my-4 border">
      <div className="badge badge-warning badge-xl">Projects</div>
      <p className="mt-4 text-base-content/70">Projects related to this pool</p>
      <div className="grid gap-4 grid-cols-4 my-4">
        {poolProjects.map((project) => {
          return (
            <Link href={`${ROUTES.PROJECT}${project.id}`} key={project.id}>
              <Card
                title={project.title}
                description={
                  <p className="truncate flex gap-2">
                    {formatEther(project.amountRequired)}{" "}
                    <EthereumIcon className="w-4 h-4" />
                  </p>
                }
                className="max-w-64 hover:scale-105 cursor-pointer bg-base-100 border-gray-200 border-4"
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default PoolProjects
