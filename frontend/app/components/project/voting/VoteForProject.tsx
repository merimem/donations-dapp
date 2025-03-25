import { useState } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import config from "~/config/contract"

interface VoteFormProps {
  projectId: string
}

const VoteForm = ({ projectId }: VoteFormProps) => {
  const [vote, setVote] = useState<boolean>(false)
  const { data: hash, error: errorContract, writeContract } = useWriteContract()
  const { isLoading, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleVote = async () => {
    if (vote === null) {
      //toast.error("Please select a vote option.");
      return
    }

    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "voteOnProject",
        args: [BigInt(projectId), vote],
      })

      //   toast.success(
      //     `Successfully voted to ${vote ? "approve" : "reject"} the project.`
      //   )
    } catch (error) {
      console.error(error)
      //toast.error("Failed to submit vote.")
    } finally {
      //setIsLoading(false)
    }
  }

  return (
    <div className="alert  alert-info alert-outline  m-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Unlock the target amount:</h2>

      <div className="flex space-x-4 mb-4">
        <input
          type="checkbox"
          checked={vote}
          className="toggle border-error bg-error checked:bg-success checked:text-green-800 checked:border-success "
          onChange={() => setVote(!vote)}
        />
      </div>

      <button
        onClick={handleVote}
        disabled={isLoading || vote === null}
        className="w-full btn btn-primary"
      >
        {isLoading ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  )
}

export default VoteForm
