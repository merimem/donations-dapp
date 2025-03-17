import { MetaFunction } from "@remix-run/node"
import { formatEther } from "viem"
import { useAccount, useReadContract } from "wagmi"
import { readContract } from "@wagmi/core"
import Title from "~/components/layout/title"
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  CONTRACT_VERA_ABI,
  CONTRACT_VERA_ADDRESS,
} from "~/config/contract"
import { useNavigate, useNavigation } from "@remix-run/react"
import Loading from "~/components/layout/Loading"
import { useEffect, useMemo, useState } from "react"
import { publicClient } from "~/utils/client"
import EthereumIcons from "~/components/layout/icons/EthereumIcon"
import EthereumIcon from "~/components/layout/icons/EthereumIcon"
import TableDonations from "~/components/profile/TableDonations"

export const meta: MetaFunction = () => {
  return [
    { title: "Good4Chain - Profile" },
    { name: "description", content: "User profile!" },
  ]
}

export default function Profile() {
  const { address, isConnected, status } = useAccount()
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<bigint[]>([])
  const [veraBalance, setVeraBalance] = useState<bigint | null>(null)

  const navigate = useNavigate()

  if (status === "disconnected") {
    navigate("/")
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await Promise.all(
          [1, 2, 3, 4, 5].map(
            async (i) =>
              await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "getContribution",
                args: [i, address!],
              })
          )
        )
        const veraBalance = await publicClient.readContract({
          address: CONTRACT_VERA_ADDRESS,
          abi: CONTRACT_VERA_ABI,
          functionName: "balanceOf",
          args: [address!],
        })
        setContributions(data)
        setVeraBalance(veraBalance)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [address])

  const total = useMemo(
    () =>
      formatEther(
        contributions
          .map((contribution) => BigInt(contribution)) // Assure que chaque valeur est bien un BigInt
          .reduce((sum, contribution) => sum + contribution, BigInt(0))
      ),
    [contributions]
  )

  return (
    <div className="flex flex-col justify-center p-4">
      <Title type="h1" className="p-4">
        My Profile
      </Title>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="stats shadow m-4">
            <div className="stat">
              <div className="stat-title text-xs max-w-64">{address}</div>
              <div className="stat-figure text-secondary">
                <div className="avatar online">
                  <div className="w-16 rounded-full">
                    <img src="/avatar.png" />
                  </div>
                </div>
              </div>
            </div>
            <div className="stat">
              <div className="stat-figure text-primary">
                <EthereumIcon className="w-12 h-12" isPink={true} />
              </div>
              <div className="stat-title">Total Donations</div>

              <div className="stat-value text-primary flex gap-4">
                {total} ETH
              </div>
              {/* <div className="stat-desc">21% more than last month</div> */}
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-8 w-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">VERA balance</div>
              <div className="stat-value text-secondary">
                {veraBalance ? formatEther(veraBalance) : null}
              </div>
              <div className="stat-desc"></div>
            </div>
          </div>
          <TableDonations contributions={contributions} />
        </>
      )}
    </div>
  )
}
