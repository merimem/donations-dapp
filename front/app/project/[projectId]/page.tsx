"use client"
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { formatEther, parseAbiItem } from "viem"
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import Loading from "@/components/layout/Loading"
import Timeline from "@/components/layout/Timeline/Timeline"
import { timelineProps } from "@/components/layout/Timeline/Timeline.utils"
import Coupons from "@/components/project/voting/Coupons"
import FinnalizeVote from "@/components/project/voting/FinnalizeVote"
import ReclaimFundsForm from "@/components/project/voting/ReclaimFundsForm"
import VoteForm from "@/components/project/voting/VoteForProject"
import config from "@/config/contract"
import { UserType } from "@/modules/users/users.typedefs"
import { publicClient } from "@/utils/client"
import { useParams } from "next/navigation"
import Link from "next/link"

type ProjectPageRouteParams = {
  projectId: string
}

export default function ProjectComponent() {
  const { address } = useAccount()
  const [userType, setUserType] = useState<string | null>()
  const [blockNumber, setBlockNumber] = useState<bigint>()
  const [events, setEvents] = useState([])
  useLayoutEffect(() => {
    const userType = window.localStorage.getItem("userType")
    setUserType(userType)
  }, [])
  const router = useParams<ProjectPageRouteParams>()
  const { projectId } = router

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
  const getBlockNumber = async () => {
    const b = await publicClient.getBlockNumber()
    setBlockNumber(b)
  }
  useEffect(() => {
    const getBlock = async () => {
      if (address) {
        await getBlockNumber()
      }
    }
    getBlock()
  }, [])

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Link className="btn btn-soft btn-accent content" href="/projects">
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
            <h2 className="card-title text-2xl font-bold">
              {projectContract.title}
            </h2>
            <p>This project is managed by {projectContract.ong}</p>
            <p>
              Funds will be transferred directly to the wallet{" "}
              {projectContract.partner} in the form of NFTs.
            </p>
            {/* <p>{projectDB.description}</p> */}
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
        {projectContract?.status === 0 && (
          <div role="alert" className="alert alert-warning alert-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              The project was created in the block {projectContract.startBlock}.{" "}
              <p>Actual Block {blockNumber}.</p>
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
        {projectContract?.status && projectContract?.status > 2 && (
          <Coupons projectId={projectId} />
        )}
      </div>
    </div>
  )
}
