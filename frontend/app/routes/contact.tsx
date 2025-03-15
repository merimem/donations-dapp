import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { getAllContacts } from "../../prisma/modules/contact/contact"
import type { GetAllContacts } from "./contacts.enum"
export const loader = async () => {
  const contactList = await getAllContacts()
  return contactList
}

export default function ContactLists() {
  const data = useLoaderData()
  return (
    <div>
      <h1>Contacts Lists</h1>
      <Link to="/contacts/new">
        <button>Create Contact</button>
      </Link>

      {data.map((contact: GetAllContacts) => {
        return (
          <Link to={`/contacts/${contact.id}`} key={contact.id}>
            <h2>
              {contact.firstName} {contact.lastName}
            </h2>
          </Link>
        )
      })}
      {/* <Outlet /> */}
    </div>
  )
}
