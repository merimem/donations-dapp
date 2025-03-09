export type GetAllContacts = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type CreateContact = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type UpdateContact = {
  id?: number
  firstName: string
  lastName: string
  email: string
  phone: string
}
