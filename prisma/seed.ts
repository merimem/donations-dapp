import { PrismaClient } from "@prisma/client"

const seedData = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@gmail.com",
    phone: "+123456789",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@gmail.com",
    phone: "+987654321",
  },
]

async function seed() {
  const prisma = new PrismaClient()

  try {
    for (const contact of seedData) {
      await prisma.contactList.create({
        data: contact,
      })
    }

    console.log("Seed data has been inserted successfully.")
  } catch (error) {
    console.error("Error seeding data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
