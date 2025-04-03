import { useContext } from "react"
import { useReadContract } from "wagmi"
import config from "~/config/contract"
import { UserContext } from "../context/UserContext"
import Loading from "../layout/Loading"
import ActionsButton from "./ActionsButton"

const AssociationsRequest = () => {
  const {
    data: associationsData,
    isLoading,
    isError,
  } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getAllAssociations",
    args: [BigInt(0), BigInt(100)],
  })
  const [associations, addresses] = associationsData || [[], []]

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
