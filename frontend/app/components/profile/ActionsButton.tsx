import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/solid"
import React from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import Loading from "../layout/Loading"
interface ActionsButtonProps {
  address: `0x${string}`
}

const ActionsButton = ({ address }: ActionsButtonProps) => {
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
  const handleReject = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "rejectAssociation",
        args: [address],
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleApprove = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "approveAssociation",
        args: [address],
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex gap-4">
      <button className="btn" onClick={handleReject}>
        <TrashIcon className="w-6 h-6 text-error" />
      </button>
      <button className="btn" onClick={handleApprove}>
        <CheckCircleIcon className="w-6 h-6 text-success" />
      </button>
      {isConfirming && <Loading />}
      {isConfirmed && <p className="text-success"> Success</p>}
      {errorContract?.message && <p className="text-error"> Error</p>}
    </div>
  )
}

export default ActionsButton
