import { LoaderFunction } from "@remix-run/node"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { formatEther, parseAbiItem } from "viem"
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { UserContext } from "~/components/context/UserContext"
import Loading from "~/components/layout/Loading"
import Timeline from "~/components/layout/Timeline/Timeline"
import { timelineProps } from "~/components/layout/Timeline/Timeline.utils"
import Coupons from "~/components/project/voting/Coupons"
import FinnalizeVote from "~/components/project/voting/FinnalizeVote"
import ReclaimFundsForm from "~/components/project/voting/ReclaimFundsForm"
import VoteForm from "~/components/project/voting/VoteForProject"
import config from "~/config/contract"
import { getProjectByprojectId } from "~/modules/projects/project.server"
import { Project, ProjectStatus } from "~/modules/projects/project.typedefs"
import { UserType } from "~/modules/users/users.typedefs"
import { publicClient } from "~/utils/client"

type LoaderData = {
  project: Project
}

export const loader: LoaderFunction = async ({ params }) => {
  const { projectId } = params
  if (!projectId) {
    throw new Error("Project not found")
  }

  const project = await getProjectByprojectId({ projectId })

  return { project }
}

export default function ProjectComponent() {
  const { project: projectDB } = useLoaderData<LoaderData>() as LoaderData
  const { address } = useAccount()
  const params = useParams()
  const [userType, setUserType] = useState<string | null>()
  const [events, setEvents] = useState([])
  useLayoutEffect(() => {
    const userType = window.localStorage.getItem("userType")
    setUserType(userType)
  }, [])
  const { projectId } = params

  if (!projectId) return null

  const {
    data: projectContract,
    isLoading,
    isError,
  } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getProject",
    args: [BigInt(projectId)],
  })
  const displayVoteForm = projectContract?.status === 0
  const getEvents = async () => {
    const projectStatusEvents = await publicClient.getLogs({
      address: config.Chain4Good.address,
      event: parseAbiItem(
        "event ProjectStatusChanged(uint256 projectId, uint8 status)"
      ),
    })
    console.log("projectStatusEvents", projectStatusEvents)
  }
  const {
    data: hash,
    error: errorContract,
    isPending,
    writeContract,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })
  useEffect(() => {
    const getAllEvents = async () => {
      if (address) {
        await getEvents()
      }
    }
    getAllEvents()
  }, [address])

  const handleCloseProject = async () => {
    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "changeProjectStatus",
        args: [BigInt(projectId), 4],
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Link className="btn btn-soft btn-accent content" to="/projects">
          See all projects
        </Link>
      </div>
      <div className="card m-16 bg-base-100  card-xl shadow-sm ">
        <figure className="h-48">
          <img src="/projectThumbnail.jpg" alt="Project thumbnail" />
        </figure>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <p>Error</p>
        ) : projectContract ? (
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold">{projectDB.title}</h2>
            <p>{projectDB.description}</p>
          </div>
        ) : null}
        {projectContract && (
          <div className="stats shadow max-w-48 bg-base-300 m-6">
            <div className="stat">
              <div className="stat-title">Target Amount</div>
              <div className="stat-value">
                {projectContract ? (
                  <span>
                    {formatEther(projectContract?.amountRequired)} Eth
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}
        {projectContract && (
          <Timeline itemsProps={timelineProps(projectContract)} />
        )}
        {displayVoteForm && <VoteForm projectId={projectId} />}
        {userType === UserType.Owner && <FinnalizeVote projectId={projectId} />}
        {userType === UserType.Owner &&
          projectContract?.status === 3 &&
          projectContract.couponsHasBeenCreated && (
            <button className="btn btn-error" onClick={handleCloseProject}>
              Close project
            </button>
          )}
        {userType === UserType.Association && (
          <ReclaimFundsForm projectId={projectId} />
        )}
        {userType === UserType.Association && <Coupons projectId={projectId} />}
      </div>
    </div>
  )
}
