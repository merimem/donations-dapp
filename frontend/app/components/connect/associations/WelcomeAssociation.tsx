interface ProfileProps {
  name: string
  isApproved: boolean
}

const WelcomeAssociation = (association: ProfileProps) => {
  return (
    <div>
      <p>Welcome {association.name}, votre association est déjà enregistrée.</p>
      {association.isApproved ? (
        <p>Your registration request has been approved. </p>
      ) : (
        <p>
          Your registration is currently under review or may have been rejected.
        </p>
      )}
    </div>
  )
}

export default WelcomeAssociation
