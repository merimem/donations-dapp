import { useLoaderData } from "@remix-run/react"
import React from "react"
import PoolsCards from "~/components/pools/PoolsCards"
import { getAllProjects } from "~/modules/projects/project.server"
import { Project } from "~/modules/projects/project.typedefs"

const Pools = () => {
  return <PoolsCards />
}

export default Pools
