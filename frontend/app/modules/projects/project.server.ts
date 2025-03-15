import {
  createProjectDB,
  getAllProjectsDB,
} from "prisma/modules/project/project"
import { CreateProject } from "./project.typedefs"

export const getAllProjects = async () => {
  try {
    return await getAllProjectsDB()
  } catch (error) {
    Promise.reject(error)
  }
}

interface CreateProjectProps {
  project: CreateProject
}

export const createProject = async ({ project }: CreateProjectProps) => {
  return createProjectDB(project).then(() => {})
}
