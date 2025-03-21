import { LoaderFunction } from "@remix-run/node"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { useContext } from "react"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import { UserContext } from "~/components/context/UserContext"
import Loading from "~/components/layout/Loading"
import Timeline from "~/components/layout/Timeline/Timeline"
import VoteForm from "~/components/project/voting/VoteForProject"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import { getProjectByprojectId } from "~/modules/projects/project.server"
import { Project, ProjectStatus } from "~/modules/projects/project.typedefs"
import { UserType } from "~/modules/users/users.typedefs"

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
  const params = useParams()
  const contextUser = useContext(UserContext)

  const { projectId } = params

  if (!projectId) return null

  const {
    data: projectContract,
    isLoading,
    isError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getProject",
    args: [BigInt(projectId)],
  })

  const timelineProps = () => {
    const keys = Object.keys(ProjectStatus).filter((key) => isNaN(Number(key)))
    if (projectContract) {
      return keys.map((key, index) => {
        const currentStatusIndex = projectContract?.status
        const keyIndex = ProjectStatus[key as keyof typeof ProjectStatus]

        return {
          timelineStart: key,
          isSelected:
            currentStatusIndex === ProjectStatus.Completed ||
            keyIndex <= currentStatusIndex,
          index,
          totalItems: keys.length,
        }
      })
    }
    return []
  }

  const displayVoteForm = projectContract?.status === 0
  //&& contextUser.userType === UserType.Donator
  console.log(projectContract?.status === 0, contextUser.userType)

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Link className="btn btn-soft btn-accent content" to="/projects">
          See all projects
        </Link>
        {/* <Tooltip dataTip="Create a new project in this pool">
          <Link
            className="btn btn-soft btn-warning content"
            to={`/projects/new/${type}`}
          >
            Create project
          </Link>
        </Tooltip> */}
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
        {projectContract && <Timeline itemsProps={timelineProps()} />}
        {displayVoteForm && <VoteForm projectId={projectId} />}
      </div>
    </div>
  )
}
