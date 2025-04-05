import Link from "next/link"
import React from "react"

const WelcomeAdmin = () => {
  return (
    <>
      <div>Welcome Owner</div>
      <Link href="/profile" className="btn btn-info">
        Go to dashboard
      </Link>
    </>
  )
}

export default WelcomeAdmin
