import { ConnectButton } from "@rainbow-me/rainbowkit"
import { MetaFunction } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "Chain4Good" },
    { name: "description", content: "Connection" },
  ]
}

export default function Connect() {
  return (
    <div className="flex justify-between items-center p-5">
      <div>Logo</div>
      <div>
        <ConnectButton showBalance={false} />
      </div>
    </div>
  )
}
