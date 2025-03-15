import { PROJECT_STATUS } from "./project.constants"

export type Project = {
  id: number
  title: string
  description: string
  targetAmount: number
  amountRaised: number
  status: PROJECT_STATUS
  startDate: string
}

export type GetAllProjects = {
  id: number
  title: string
  description: string
  targetAmount: number
  amountRaised: number
  status: string
  startDate: string
}

export type CreateProject = {
  title: string
  description: string
  targetAmount: number
  amountRaised: 0
  status: PROJECT_STATUS.ACTIVE
  startDate: string
  image: Buffer<ArrayBuffer>
}

export type UpdateProject = {
  id?: number
  title: string
  description: string
  targetAmount: number
  amountRaised: number
  status: string
  startDate: string
}
