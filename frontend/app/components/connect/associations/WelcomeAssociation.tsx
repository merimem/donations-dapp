interface ProfileProps {
  name: string
  isApproved: boolean
}

const WelcomeAssociation = (association: ProfileProps) => {
  return (
    <div>
      <p>
        Bienvenue {association.name}, votre association est déjà enregistrée.
      </p>
      {association.isApproved ? (
        <p>
          Votre association a été approuvé. Vous pouvez postuler pour des
          projets
        </p>
      ) : (
        <p>
          Votre association n'a pas été encore approuvée ou bien a été rejetée.
          Vous ne pouvez pas postuler aux projets.
        </p>
      )}
    </div>
  )
}

export default WelcomeAssociation
