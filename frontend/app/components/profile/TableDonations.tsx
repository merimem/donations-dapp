import React from "react"
import { formatEther } from "viem"
import { PoolType } from "~/modules/pools/pools.typedefs"

interface TableDonationsProps {
  contributions: bigint[]
}

const TableDonations = ({ contributions }: TableDonationsProps) => {
  return (
    <div className="overflow-x-auto p-24">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Pool Name</th>
            <th>Total donation</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((amount, index) => {
            return (
              <tr>
                <th>{index}</th>
                <td>{PoolType[index]}</td>
                <td>{formatEther(amount)} Eth</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TableDonations
