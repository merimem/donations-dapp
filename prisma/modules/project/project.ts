import { PrismaClient } from "@prisma/client"
import {
  CreateProject,
  UpdateProject,
} from "~/modules/projects/project.typedefs"

const db = new PrismaClient()

export const getAllProjectsDB = async () => {
  return await db.contactList.findMany()
}

export const getProjectById = async (id: number) => {
  return await db.contactList.findUnique({
    where: {
      id,
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
  return await db.contactList.update({
    where: {
      id,
    },
    data: contact,
  })
}

export const deleteProjectDB = async (id: number) => {
  return await db.contactList.delete({
    where: {
      id,
    },
  })
}
