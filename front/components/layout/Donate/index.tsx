import { useEffect, useState } from "react"
import { formatEther, parseAbiItem, parseEther } from "viem"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import config from "@/config/contract"
import EthereumIcon from "../icons/EthereumIcon"
import { publicClient } from "@/utils/client"
import { Address } from "@/shared/types"

interface DonateProps {
  poolNumber: number
}

interface Event {
  type: string
  address?: Address
  pool?: number
  amount?: bigint
  blockTimestamp: number
}
const Donate = ({ poolNumber }: DonateProps) => {
  const [amount, setAmount] = useState("")
  const { address } = useAccount()
  const [events, setEvents] = useState<Event[]>([])
  const [eventsStatus, setEventsstatus] = useState<Event[]>([])
  const { data: hash, error, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const handleDonate = async () => {
    try {
      await writeContract({
        address: config.Chain4Good.address,
        abi: config.Chain4Good.abi,
        functionName: "donate",
        value: parseEther(amount),
        // account: address,
        args: [poolNumber],
      })
    } catch (error) {
      console.log(error)
    }
  }

  const getEvents = async () => {
    const donationReceived = await publicClient.getLogs({
      address: config.Chain4Good.address,
      event: parseAbiItem(
        "event DonationReceived(address indexed donor, uint8 pool, uint256 amount)"
      ),
      // du 7895383 bloc
    })

    const combinedEvents = donationReceived.map((event) => {
      return {
        type: "DonationReceived",
        address: event.args.donor,
        pool: event.args.pool,
        amount: event.args.amount,
        blockTimestamp: Number(event.blockNumber),
      }
    })

    const sortedEvents = combinedEvents.sort(
      (a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp)
    )
    setEvents(sortedEvents)
  }

  useEffect(() => {
    const getAllEvents = async () => {
      if (address) {
        await getEvents()
      }
    }
    getAllEvents()
  }, [address])

  return (
    <div>
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
                      <span className="text-xl font-bold">{value} Eth</span>
                    </label>
                  ))}

                  {/* Custom Amount Input */}
                  <label
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer col-span-3 ${
                      amount === "custom" ? "border-primary" : "border-muted"
                    }`}
                    //onClick={() => setAmount(value)}
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
                        onChange={(e) => setAmount(e.target.value)}
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
                Donate {amount}
                <EthereumIcon isLight />
              </button>
            </div>
          </form>
        </div>

        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && (
          <div className="text-alert">Waiting for confirmation...</div>
        )}
        {isConfirmed && (
          <div className="text-success">Transaction confirmed.</div>
        )}
        {error && <div className="text-error">Error {error.message}</div>}
      </div>
      <div className="mt-4">
        {events.length && <span>Donations</span>}
        {events.map((e, i) => {
          return (
            <div key={String(e.address) + String(e.amount) + String(i)}>
              {e.address} donated{" "}
              <span className="text-warning">
                {e.amount ? `${formatEther(e.amount)} Eth` : null}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Donate
