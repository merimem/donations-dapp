import { useReadContract } from "wagmi"
import Loading from "~/components/layout/Loading"
import config from "~/config/contract"
import InscriptionForm from "./InscriptionForm"
import WelcomeAssociation from "./WelcomeAssociation"

interface ConnexionAssociationParams {
  address: `0x${string}`
}

type Association = readonly [string, boolean]
const ConnexionAssociation = ({ address }: ConnexionAssociationParams) => {
  const {
    data: association,
    isPending,
    error,
    refetch,
  } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getAssociation",
    args: [address!],
  })

  return (
    <>
      {isPending && <Loading />}
      {error ? (
        <InscriptionForm address={address!} />
      ) : association ? (
        <WelcomeAssociation name={association[0]} isApproved={association[1]} />
      ) : null}
    </>
  )
}

export default ConnexionAssociation
