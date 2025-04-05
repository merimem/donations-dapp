"use client"
import WelcomeAdmin from "@/components/connect/admin/WelcomeAdmin"
import ConnexionAssociation from "@/components/connect/associations/ConnexionAssociation"
import WelcomeDonator from "@/components/connect/donator/WelcomeDonator"
import { UserContext } from "@/components/context/UserContext"
import config from "@/config/contract"
import { UserType } from "@/modules/users/users.typedefs"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useParams } from "next/navigation"
import { useContext, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"

export default function Connect() {
  const { address, isConnected } = useAccount()
  const router = useParams()
  const { userType } = router

  const { data: contractOwner } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "owner",
  })

  const contextUser = useContext(UserContext)

  useEffect(() => {
    let userTypeToSet
    if (isConnected && address && address === contractOwner) {
      userTypeToSet = UserType.Owner
    } else if (isConnected && address && userType === UserType.Association) {
      userTypeToSet = UserType.Association
    } else if (isConnected && address && userType === UserType.Donator) {
      userTypeToSet = UserType.Donator
    }
    if (userTypeToSet) {
      contextUser.setUserType(userTypeToSet)
      localStorage.setItem("userType", userTypeToSet)
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
    </div>
  )
}
