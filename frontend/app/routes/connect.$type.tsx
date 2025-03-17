import { ConnectButton } from "@rainbow-me/rainbowkit"
import { MetaFunction, useNavigate } from "@remix-run/react"
import { useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good" },
    { name: "description", content: "Connection" },
  ]
}

export default function Connect() {
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected) navigate("/")
  }, [isConnected])

  const navigate = useNavigate()

  return (
    <div className="flex justify-center flex-col my-0 items-center p-5 m-4">
      <h1>Sign in</h1>
      {!isConnected && (
        <div>
          <ConnectButton showBalance={false} />
        </div>
      )}
      {isConnected}
    </div>
  )
}
