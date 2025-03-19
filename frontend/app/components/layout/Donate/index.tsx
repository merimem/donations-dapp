import { useState } from "react"
import { parseEther } from "viem"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"

interface DonateProps {
  poolNumber: number
}
const Donate = ({ poolNumber }: DonateProps) => {
  const [amount, setAmount] = useState("")
  const { address } = useAccount()

  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const handleDonate = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "donate",
        value: parseEther(amount),
        // account: address,
        args: [poolNumber],
      })
    } catch (error) {
      console.log(error)
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  return (
    <>
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <div className="join">
          <input
            type="number"
            placeholder="Amount in ETH..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input join-item"
          />
          <button
            className="btn join-item btn-primary"
            onClick={handleDonate}
            disabled={isPending}
          >
            Donate
          </button>
        </div>
      </fieldset>
      {/* <input
        type="number"
        placeholder="Amount in ETH..."
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
      />
      <button
        className="btn btn-secondary w-full"
        onClick={handleDonate}
        disabled={isPending}
      >
        {isPending ? "Depositing..." : "Deposit"}
      </button> */}
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && (
        <div className="text-alert">Waiting for confirmation...</div>
      )}
      {isConfirmed && (
        <div className="text-success">Transaction confirmed.</div>
      )}
      {error && <div>Error: {error.shortMessage || error.message}</div>}
    </>
  )
}

export default Donate
