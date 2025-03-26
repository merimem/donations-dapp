import { MetaFunction } from "@remix-run/node"
import { useNavigate } from "@remix-run/react"
import { useContext, useEffect, useMemo, useState } from "react"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { UserContext } from "~/components/context/UserContext"
import EthereumIcon from "~/components/layout/icons/EthereumIcon"
import Loading from "~/components/layout/Loading"
import Title from "~/components/layout/title"
import AssociationsRequest from "~/components/profile/AssociationsRequest"
import TableDonations from "~/components/profile/TableDonations"
import config from "~/config/contract"
import { UserType } from "~/modules/users/users.typedefs"
import { publicClient } from "~/utils/client"

export const meta: MetaFunction = () => {
  return [
    { title: "Good4Chain - Profile" },
    { name: "description", content: "User profile!" },
  ]
}

export default function Profile() {
  const { address, isConnected, status, isConnecting } = useAccount()
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<bigint[]>([])
  const [veraBalance, setVeraBalance] = useState<bigint | null>(null)
  const contextUser = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (status === "disconnected") {
      navigate("/")
    }
  }, [status])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await Promise.all(
          [1, 2, 3, 4, 5].map(
            async (i) =>
              await publicClient.readContract({
                address: config.Chain4Good.address,
                abi: config.Chain4Good.abi,
                functionName: "getContribution",
                args: [i, address!],
              })
          )
        )
        const veraBalance = await publicClient.readContract({
          address: config.VeraToken.address,
          abi: config.VeraToken.abi,
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

    if (address) fetchData()
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
    <div className="flex flex-col justify-center p-4 max-w-[70%] bg-gray-700 rounded mx-auto my-0">
      <Title type="h1" className="p-4">
        My Profile
      </Title>
      {loading ? (
        <Loading />
      ) : (
        isConnected && (
          <>
            <div className="stats shadow m-4 bg-base-200">
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
                  {veraBalance?.toString()}
                </div>
                <div className="stat-desc"></div>
              </div>
            </div>
            <TableDonations contributions={contributions} />
            {contextUser.userType === UserType.Owner && <AssociationsRequest />}
          </>
        )
      )}
    </div>
  )
}
