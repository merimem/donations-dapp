import { ActionFunction } from "@remix-run/node"
import {
  Form,
  MetaFunction,
  useFetcher,
  useNavigate,
  useParams,
} from "@remix-run/react"
import { useEffect, useState } from "react"
import { keccak256, parseEther, toHex } from "viem"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import Loading from "~/components/layout/Loading"
import config from "~/config/contract"
import { PoolType } from "~/modules/pools/pools.typedefs"
import { createProject } from "~/modules/projects/project.server"

export type ActionData = {
  success: boolean
  error: boolean
}

export const meta: MetaFunction = () => {
  return [
    { title: "Good4Chain - New Project" },
    { name: "description", content: "New project!" },
  ]
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    targetAmount: formData.get("targetAmount") as string,
    projectId: formData.get("projectId") as string,
    poolType: formData.get("poolType") as string,
  }
  try {
    console.log("data", data)
    return createProject({
      project: {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
      },
    }).then(async () => {
      return Response.json({
        success: true,
        error: false,
      })
    })
  } catch (error) {
    console.log("error", error)
    return Response.json({
      success: false,
      error: true,
    })
  }
}
export const loader = async () => {
  return { address: null }
}

export default function Create() {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [targetAmount, setTargetAmount] = useState("")

  const fetcher = useFetcher<ActionData>()
  const navigate = useNavigate()
  const params = useParams<{ poolType: string }>()
  const { poolType } = params
  console.log("poolType", poolType)
  const poolValue = PoolType[poolType!]

  useEffect(() => {
    if (!poolType || !(poolType in PoolType)) {
      navigate("/")
    }
  }, [poolType])

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
    const projectId = BigInt(
      keccak256(toHex(`${title}-${description}-${Date.now()}`))
    )

    const formData = new FormData()
    formData.set("title", title)
    formData.set("description", description)
    formData.set("targetAmount", targetAmount)
    formData.set("projectId", projectId.toString())
    formData.set("poolType", poolType!)

    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "createProject",
        args: [projectId, Number(poolValue)!, parseEther(targetAmount)],
      })

      fetcher.submit(formData, {
        method: "POST",
        encType: "multipart/form-data",
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
          <Form method="post" className="w-full my-2 " onSubmit={handleSubmit}>
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
            </fieldset>
            <button className="btn btn-primary mt-4" disabled={isPending}>
              {isPending ? <Loading /> : "Add project"}
            </button>
          </Form>
        </div>
        <div className="join-item">
          <p className="font-bold">Logs</p>
          <div>
            {fetcher.data?.error && (
              <p className="text-error">
                There is an error submitting the field !
              </p>
            )}
            {errorContract && (
              <p className="text-error">
                <div>
                  Error editing contract:{" "}
                  {errorContract?.shortMessage || errorContract.message}
                </div>
              </p>
            )}
            {fetcher.data?.success && (
              <p className="text-accent">The project was created in the DB !</p>
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
