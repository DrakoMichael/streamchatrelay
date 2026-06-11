import { PrismaClient } from "@prisma/client"

class prismaClient {
  static instance

  static getInstance() {
    if (!prismaClient.instance) {
      prismaClient.instance = new PrismaClient()
    }

    return prismaClient.instance
  }
}

export default prismaClient