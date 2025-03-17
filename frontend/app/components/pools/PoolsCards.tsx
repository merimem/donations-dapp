import React from "react"
import { useAccount, useReadContract } from "wagmi"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import { PoolType } from "~/modules/pools/pools.typedefs"
import Card from "../layout/Card"
import { useNavigate } from "@remix-run/react"
import { ROUTES } from "~/utils/routes/routes.constants"

const PoolsCards = () => {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  return (
    <>
      {isConnected ? (
        <>
          <h1 className="font-bold flex justify-center text-xl mb-4 text-primary">
            Our Active pools
          </h1>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(PoolType)
              .filter((key) => isNaN(Number(key)))
              .map((key) => {
                return (
                  <Card
                    imageUrl={`${key}.jpg`}
                    title={key}
                    description={
                      <p className="">
                        <span className="text-success">25$ </span> recolted
                      </p>
                    }
                    className="hover:scale-105 cursor-pointer"
                    onClick={() => navigate(`${ROUTES.POOLS}/${key}`)}
                    key={key}
                  />
                )
              })}
          </div>
        </>
      ) : null}
    </>
  )
}

export default PoolsCards
