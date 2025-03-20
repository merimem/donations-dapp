import { createContext } from "react"
import { UserType } from "~/modules/users/users.typedefs"

interface UserContextContextProps {
  userType: UserType | null
  setUserType: (type: UserType) => void
}

export const UserContext = createContext<UserContextContextProps>({
  userType: null,
  setUserType: () => {},
})
