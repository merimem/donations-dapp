import { PrismaClient } from "@prisma/client"
import {
  CreateProject,
  Project,
  UpdateProject,
} from "~/modules/projects/project.typedefs"

const db = new PrismaClient()

export const getAllProjectsDB = async () => {
  return await db.projectList.findMany()
}

export const getProjectById = async (id: number) => {
  return await db.projectList.findUnique({
    where: {
      id,
    },
  })
}

export const getProjectByprojectIdDB = async (id: Project["projectId"]) => {
  return await db.projectList.findFirst({
    where: {
      projectId: id,
    },
  })
}

export const createProjectDB = async (project: CreateProject) => {
  try {
    return await db.projectList.create({ data: project })
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export const updateProjectDB = async (id: number, contact: UpdateProject) => {
  return await db.projectList.update({
    where: {
      id,
    },
    data: contact,
  })
}

export const deleteProjectDB = async (id: number) => {
  return await db.projectList.delete({
    where: {
      id,
    },
  })
}
