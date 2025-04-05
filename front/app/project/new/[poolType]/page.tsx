"use client"
import Loading from "@/components/layout/Loading"
import config from "@/config/contract"
import { PoolType } from "@/modules/pools/pools.typedefs"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { keccak256, parseEther, toHex } from "viem"
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

export default function Create() {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [targetAmount, setTargetAmount] = useState("")
  const [partnerAddress, setPartnerAddress] = useState<string>("0x")
  const [selectedAssociation, setSelectedAssociation] =
    useState<`0x${string}`>("0x")

  const router = useParams()
  const { poolType } = router

  const poolValue = PoolType[poolType!]
  const {
    data: associationsData,
    isLoading,
    isError,
  } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getAllAssociations",
    args: [BigInt(0), BigInt(100)],
  })
  const [associations, addresses] = associationsData || [[], []]
  const mergedTable = associations.map((association, index) => ({
    ...association,
    address: addresses[index],
  }))

  useEffect(() => {
    setSelectedAssociation(addresses[0])
  }, [addresses])

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

  const handleSelectAssociation = async (
    e: React.FormEvent<HTMLSelectElement>
  ) => {
    setSelectedAssociation(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const projectId = BigInt(
      keccak256(toHex(`${title}-${description}-${Date.now()}`))
    )

    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "createProject",
        args: [
          projectId,
          Number(poolValue)!,
          parseEther(targetAmount),
          selectedAssociation,
          //@ts-ignore
          partnerAddress,
        ],
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="items-center justify-center">
      <div className=" items-center justify-evenly join w-full gap-4">
        <div className="join-item  border-r-2 px-4">
          <h3 className="text-base mb-4">
            Create a new project in the pool{" "}
            <span className="text-warning">{poolType}</span>
          </h3>
          <form method="post" className="w-full my-2 " onSubmit={handleSubmit}>
            <fieldset className="fieldset max-w-72 w-xs glass to-primary border border-base-300 p-4 rounded-box center">
              <label className="fieldset-label" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                name="title"
                className="input input-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label className="fieldset-label" htmlFor="title">
                Description
              </label>
              <textarea
                className="textarea textarea-xl"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <label className="fieldset-label" htmlFor="targetAmount">
                Target Amount (Eth)
              </label>
              <input
                type="number"
                className="input"
                name="targetAmount"
                min="1"
                placeholder=""
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
              <label className="fieldset-label" htmlFor="partner">
                Partner Addres (the one who will receive the amount)
              </label>
              <input
                type="text"
                className="input"
                name="partner"
                placeholder=""
                value={partnerAddress}
                onChange={(e) => setPartnerAddress(e.target.value)}
                required
              />
              <label className="fieldset-label" htmlFor="targetAmount">
                Send to
              </label>
              <select
                className="select"
                onChange={handleSelectAssociation}
                value={selectedAssociation}
                required
              >
                {mergedTable
                  .filter((asso) => asso.isApproved != false)
                  .map((addr, index) => (
                    <option value={addr.address} key={addr.address}>
                      {addr.address}
                    </option>
                  ))}
              </select>
            </fieldset>
            <button className="btn btn-primary mt-4" disabled={isPending}>
              {isPending ? <Loading /> : "Add project"}
            </button>
          </form>
        </div>
        <div className="join-item">
          <p className="font-bold">Logs</p>
          <div>
            {errorContract && (
              <p className="text-error">
                <div>
                  Error editing contract:{" "}
                  {errorContract?.shortMessage || errorContract.message}
                </div>
              </p>
            )}

            {isConfirming && (
              <div className="text-alert">Waiting for confirmation...</div>
            )}
            {isConfirmed && (
              <div className="text-accent">
                Project is added in the contract.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
