import React, { useState } from "react"
import { formatEther, parseEther } from "viem"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import config from "~/config/contract"

interface ReclaimFundsFormProps {
  projectId: string
}
const ReclaimFundsForm = ({ projectId }: ReclaimFundsFormProps) => {
  const [couponValue, setCouponValue] = useState("")
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "createCoupons",
        args: [BigInt(projectId), parseEther(couponValue)],
      })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="mx-auto mt-4 rounded-md border-2 p-4 w-[80%] ">
      <h3 className="font-semibold tracking-tight text-2xl">Reclaim funds</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Funds will be released in the form of coupons. How much amount
              should each coupon represents?
            </label>
          </div>
          <label className="label" htmlFor="title">
            Coupon value
          </label>
          <input
            type="number"
            className="flex h-10  rounded-md border  px-3 py-2 text-sm"
            placeholder="1 Eth"
            value={couponValue}
            onChange={(e) => setCouponValue(e.target.value)}
          />
        </div>
        <div className="mt-6">
          <button
            className="mx-8 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 "
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
      {isConfirming && (
        <div className="text-alert">Waiting for confirmation...</div>
      )}
      {isConfirmed && <div className="text-success">Sucess !</div>}
      {errorContract?.message && <p className="text-error"> Error</p>}
    </div>
  )
}

export default ReclaimFundsForm
