import { Link } from "@remix-run/react"
import React from "react"

const WelcomeAdmin = () => {
  return (
    <>
      <div>Welcome Owner</div>
      <Link to="/profile" className="btn btn-info">
        Go to dashboard
      </Link>
    </>
  )
}

export default WelcomeAdmin
