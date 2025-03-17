import { MetaFunction } from "@remix-run/node"
import { useAccount } from "wagmi"

export const meta: MetaFunction = () => {
  return [
    { title: "Good4Chain - Profile" },
    { name: "description", content: "User profile!" },
  ]
}

export default function Profile() {
  const { address, isConnected } = useAccount()
  return (
    <div className="avatar avatar-placeholder">
      <div className="bg-neutral text-neutral-content w-24 rounded-full"></div>
    </div>
  )
}
