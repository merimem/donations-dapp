import React, { useContext } from "react"
import { formatEther } from "viem"
import { PoolType } from "~/modules/pools/pools.typedefs"
import { UserContext } from "../context/UserContext"
import { UserType } from "~/modules/users/users.typedefs"
import AssociationsRequest from "./AssociationsRequest"

interface TableDonationsProps {
  contributions: bigint[]
}

const TableDonations = ({ contributions }: TableDonationsProps) => {
  return (
    <>
      <h2 className="text-warning font-bold text-xl mb-4"> Total donations</h2>

      <div className="overflow-x-auto p-4 bg-base-200 rounded">
        <table className="table p-24">
          <thead>
            <tr>
              <th></th>
              <th>Pool Name</th>
              <th>Total donations</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((amount, index) => {
              return (
                <tr key={index}>
                  <th>{index}</th>
                  <td>{PoolType[index]}</td>
                  <td>{formatEther(amount)} Eth</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TableDonations
