import React, { useState } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import Loading from "@/components/layout/Loading"
import config from "@/config/contract"

interface InscriptionFormProps {
  address: `0x${string}`
}

const InscriptionForm = ({ address }: InscriptionFormProps) => {
  const [name, setName] = useState("")
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
        functionName: "registerAssociation",
        args: [name, address],
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <p className="max-w-xl">
        Welcome to Chain4Good! To access our platform and receive funding,
        please submit a request to get started.
      </p>
      <h1 className="mb-4">Register your wallet: </h1>
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset max-w-72 w-xs glass to-primary border border-base-300 p-4 rounded-box center">
          <label className="fieldset-label" htmlFor="title">
            Name
          </label>
          <input
            type="text"
            name="title"
            className="input input-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </fieldset>
        <button className="btn btn-primary mt-4" disabled={isPending}>
          {isPending ? <Loading /> : "Register"}
        </button>
      </form>
      {isConfirming && (
        <div className="text-alert">Waiting for confirmation...</div>
      )}
      {isConfirmed && (
        <div className="text-accent">
          Your registration has been confirmed. An administrator will review
          your submission and get back to you shortly!
        </div>
      )}
    </>
  )
}

export default InscriptionForm
