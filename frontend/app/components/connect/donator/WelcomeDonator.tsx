import { Link, useNavigate } from "@remix-run/react"
import React from "react"
import { ROUTES } from "~/utils/routes/routes.constants"

const WelcomeDonator = () => {
  return (
    <div className="card max-w-md mx-auto mt-10 p-5 shadow-lg rounded-2xl text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
      <div className="card-content">
        <p className="text-lg">Thank you for your generosity!</p>
        {/* <p className="text-xl font-semibold mt-2">Total Donated: {totalDonated} ETH</p> */}
        <div className="mt-4">
          <Link to={ROUTES.POOLS} className="btn w-full btn-warning">
            Donate More
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WelcomeDonator
