import { Link, useLoaderData } from "@remix-run/react"
import { getAllProjects } from "~/modules/projects/project.server"
import { GetAllProjects, Project } from "~/modules/projects/project.typedefs"

type LoaderData = {
  projects: Project[]
}

export const loader = async () => {
  const projects = await getAllProjects()

  return { projects }
}

export default function ProjectLists() {
  const { projects } = useLoaderData() as LoaderData
  return (
    <div>
      <h1>Projects Lists</h1>
      <Link to="/projects/new">
        <button className="btn">Create Project</button>
      </Link>

      {projects.map((project: GetAllProjects) => {
        return (
          <Link to={`/contacts/${project.id}`} key={project.id}>
            <h2>{project.title}</h2>
          </Link>
        )
      })}
    </div>
  )
}
