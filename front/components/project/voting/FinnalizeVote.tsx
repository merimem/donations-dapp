import React from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import config from "@/config/contract"
interface FinnalizeVoteProps {
  projectId: string
}
const FinnalizeVote = ({ projectId }: FinnalizeVoteProps) => {
  const { data: hash, error: errorVote, writeContract } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleFinalizeVote = async () => {
    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "finallizeVotes",
        args: [BigInt(projectId)],
      })
    } catch (error) {
      console.error(error)
    } finally {
    }
  }
  return (
    <div className=" bg-card p-4 mx-auto mt-4 w-[400px]">
      <button
        onClick={handleFinalizeVote}
        disabled={isLoading}
        className="w-full btn btn-primary"
      >
        {"End Vote Session"}
      </button>
      {isSuccess && (
        <div className="text-accent">Successfully ended vote session.</div>
      )}
      {errorVote && (
        <div className="text-error">Failed to end vote session. !</div>
      )}
    </div>
  )
}

export default FinnalizeVote
