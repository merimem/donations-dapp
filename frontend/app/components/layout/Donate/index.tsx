import { useState } from "react"
import { parseEther } from "viem"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import EthereumIcon from "../icons/EthereumIcon"

interface DonateProps {
  poolNumber: number
}
const Donate = ({ poolNumber }: DonateProps) => {
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md mx-auto mt-4">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-2xl">
          Make a Donation
        </h3>
        <p className="text-sm text-muted-foreground">
          Support our mission with a donation.
        </p>
      </div>
      <div className="p-6 pt-0">
        <form>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Donation Amount</label>
              <div className="grid grid-cols-3 gap-4" role="radiogroup">
                {["1", "2", "3"].map((value) => (
                  <label
                    key={value}
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer `}
                    // amount === value ? "border-primary" : "border-muted"
                    //}`}
                    onClick={() => setAmount(value)}
                  >
                    <EthereumIcon className="w-16 h-16" isLight />
                    <span className="text-xl font-bold">Eth {value}</span>
                  </label>
                ))}

                {/* Custom Amount Input */}
                <label
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer col-span-3 ${
                    amount === "custom" ? "border-primary" : "border-muted"
                  }`}
                  onClick={() => setAmount(value)}
                >
                  <div className="w-full flex items-center">
                    <span className="mr-2">
                      <EthereumIcon isLight />
                    </span>
                    <input
                      className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Other amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              type="submit"
              onClick={handleDonate}
              disabled={isPending}
            >
              Donate {amount === "custom" ? customAmount || 0 : amount}{" "}
              <EthereumIcon isLight />
            </button>
          </div>
        </form>
      </div>
      {/* <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
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
      </fieldset> */}
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
    </div>
  )
}

export default Donate
