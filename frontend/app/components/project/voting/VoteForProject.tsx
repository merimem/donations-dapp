import { useState } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import config from "~/config/contract"

interface VoteFormProps {
  projectId: string
}

const VoteForm = ({ projectId }: VoteFormProps) => {
  const [vote, setVote] = useState<boolean | null>(null)
  const { data: hash, error: errorVote, writeContract } = useWriteContract()
  const { isLoading, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleVote = async () => {
    if (vote === null) {
      return
    }

    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "voteOnProject",
        args: [BigInt(projectId), vote],
      })
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 mx-auto mt-4 w-[400px]">
      <p className="text-xs text-gray-200">
        The voting has started for this project.
      </p>
      <h2 className="text-xl font-bold mb-4">
        Unlock the target amount?{" "}
        <span className="pl-4 text-warning">
          {vote ? "Yes" : vote == false ? "No" : null}
        </span>
      </h2>

      <div className="flex space-x-4 mb-4">
        <button className="btn btn-success" onClick={() => setVote(true)}>
          Yes
        </button>
        <button className="btn btn-error" onClick={() => setVote(false)}>
          No
        </button>
      </div>

      <button
        onClick={handleVote}
        disabled={isLoading || vote === null}
        className="w-full btn btn-primary"
      >
        {isLoading ? "Submitting..." : "Submit Vote"}
      </button>

      {isConfirmed && (
        <div className="text-accent">
          Successfully voted to {vote ? "approve" : "reject"} the project.
        </div>
      )}
      {errorVote && <div className="text-error">Failed to submit vote. !</div>}
    </div>
  )
}

export default VoteForm
