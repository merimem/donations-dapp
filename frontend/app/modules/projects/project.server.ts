import {
  createProjectDB,
  getAllProjectsDB,
  getProjectByprojectIdDB,
} from "prisma/modules/project/project"
import { CreateProject, Project } from "./project.typedefs"

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

interface GetProjectByprojectIdProps {
  projectId: Project["projectId"]
}

export const getProjectByprojectId = async ({
  projectId,
}: GetProjectByprojectIdProps) => {
  return getProjectByprojectIdDB(projectId)
}
