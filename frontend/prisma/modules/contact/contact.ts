import { PrismaClient } from "@prisma/client"
import { CreateContact, UpdateContact } from "~/routes/contacts.enum"

const db = new PrismaClient()

export const getAllContacts = async () => {
  return await db.contactList.findMany()
}

export const getContactById = async (id: number) => {
  return await db.contactList.findUnique({
    where: {
      id,
    },
  })
}

export const createContact = async (contact: CreateContact) => {
  try {
    return await db.contactList.create({ data: contact })
  } catch (error) {
    console.error("Error creating contact:", error)
    throw error
  }
}

export const updateContact = async (id: number, contact: UpdateContact) => {
  return await db.contactList.update({
    where: {
      id,
    },
    data: contact,
  })
}

export const deleteContact = async (id: number) => {
  return await db.contactList.delete({
    where: {
      id,
    },
  })
}
