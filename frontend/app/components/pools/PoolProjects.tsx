import { Project } from "~/modules/projects/project.typedefs"
import Card from "../layout/Card"
import Title from "../layout/title"
import { ROUTES } from "~/utils/routes/routes.constants"
import { Link } from "@remix-run/react"

interface PoolProjectsProps {
  poolType: string
  projects: Project[]
}

const PoolProjects = ({ poolType, projects }: PoolProjectsProps) => {
  const poolProjects = projects.filter(
    (project) => project.poolType === poolType
  )
  return (
    <div className="p-6 my-4">
      <Title type="h2">
        {" "}
        {poolProjects.length} project{poolProjects.length > 1 ? "s" : null} in
        this pool
      </Title>
      <div className="grid gap-4 grid-cols-4 my-4">
        {poolProjects.map((project) => {
          return (
            <Link
              to={`${ROUTES.PROJECT}${project.projectId}`}
              key={project.projectId}
            >
              <Card
                title={project.title}
                description={<p className="truncate">{project.description}</p>}
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
