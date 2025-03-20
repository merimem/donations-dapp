import React, { useContext } from "react"
import {
  useContractRead,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import Loading from "../layout/Loading"
import { UserContext } from "../context/UserContext"
import {
  CheckCircleIcon,
  TrashIcon,
  VariableIcon,
} from "@heroicons/react/24/solid"
import ActionsButton from "./ActionsButton"

const AssociationsRequest = () => {
  const contextUser = useContext(UserContext)

  console.log("contextUser", contextUser)
  const {
    data: associationsData,
    isLoading,
    isError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllAssociations",
  })
  const [associations, addresses] = associationsData || [[], []]
  console.log("associations", associations)
  console.log("addresses", addresses)
  // const { write: approveAssociation } = useWriteContract({
  //     address: CONTRACT_ADDRESS,
  //     abi: CONTRACT_ABI,
  //     functionName: 'approveAssociation',
  // });

  // const { write: rejectAssociation } = useWriteContract({
  //     address: CONTRACT_ADDRESS,
  //     abi: CONTRACT_ABI,
  //     functionName: 'rejectAssociation',
  // });

  return (
    <div className="my-4">
      <h3 className="font-bold text-xl text-warning">Admin dashboard</h3>
      <div>
        {isLoading && <Loading />}

        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>Association Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {associations &&
              associations
                .filter((asso) => asso.name != "")
                .map((asso, index) => {
                  return (
                    <tr key={index}>
                      <th>{index}</th>
                      <td>{asso.name}</td>
                      <td>{asso.isApproved ? "Approuved" : "Not approuved"}</td>
                      <td>
                        {!asso.isApproved && (
                          <ActionsButton address={addresses[index]} />
                        )}
                      </td>
                    </tr>
                  )
                })}{" "}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AssociationsRequest
