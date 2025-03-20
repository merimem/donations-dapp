import { ConnectButton } from "@rainbow-me/rainbowkit"
import { MetaFunction, useNavigate, useParams } from "@remix-run/react"
import { useContext, useEffect, useState } from "react"
import { useAccount, useReadContract } from "wagmi"
import WelcomeAdmin from "~/components/connect/admin/WelcomeAdmin"
import ConnexionAssociation from "~/components/connect/associations/ConnexionAssociation"
import WelcomeDonator from "~/components/connect/donator/WelcomeDonator"
import { UserContext } from "~/components/context/UserContext"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import { UserType } from "~/modules/users/users.typedefs"
import { publicClient } from "~/utils/client"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good" },
    { name: "description", content: "Connection" },
  ]
}

type Association = readonly [string, boolean]

export default function Connect() {
  const { address, isConnected } = useAccount()
  const { userType } = useParams()

  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
  })

  const contextUser = useContext(UserContext)

  useEffect(() => {
    if (isConnected && address && address === contractOwner) {
      contextUser.setUserType(UserType.Owner)
    } else if (isConnected && address && userType === UserType.Association) {
      contextUser.setUserType(UserType.Association)
    } else if (isConnected && address && userType === UserType.Donator) {
      contextUser.setUserType(UserType.Donator)
    }
  }, [contractOwner, isConnected])

  return (
    <div className="flex justify-center flex-col my-12 items-center p-5 ">
      {!isConnected && (
        <div>
          <ConnectButton showBalance={false} />
        </div>
      )}
      {isConnected &&
        address &&
        contextUser.userType === UserType.Association && (
          <ConnexionAssociation address={address} />
        )}
      {isConnected && contextUser.userType === UserType.Owner && (
        <WelcomeAdmin />
      )}
      {isConnected && contextUser.userType === UserType.Donator && (
        <WelcomeDonator />
      )}

      {/* {isConnected ? (
        <p className="text-success">Your wallet is connected!</p>
      ) : null} */}
    </div>
  )
}
