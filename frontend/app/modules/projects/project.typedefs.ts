export type Project = {
  id: number
  title: string
  description: string
  targetAmount: number
  poolType: string
  projectId: string
}

export type GetAllProjects = {
  id: number
  title: string
  description: string
  targetAmount: number
  projectId: string
}

export type CreateProject = {
  title: string
  description: string
  targetAmount: number
  projectId: string
  poolType: string
}

export type UpdateProject = {
  id?: number
  title: string
  description: string
  targetAmount: number
  amountRaised: number
  status: string
}

export enum ProjectStatus {
  Pending = 0,
  Approved,
  Rejected,
  Funding,
  Completed,
}
