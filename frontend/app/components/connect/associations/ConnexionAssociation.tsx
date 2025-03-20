import React, { useEffect, useState } from "react"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "~/config/contract"
import { publicClient } from "~/utils/client"
import InscriptionForm from "./InscriptionForm"
import WelcomeAssociation from "./WelcomeAssociation"
import { useReadContract } from "wagmi"
import Loading from "~/components/layout/Loading"

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
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
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
