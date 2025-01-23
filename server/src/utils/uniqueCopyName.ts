import { randomUUID } from "node:crypto"

const uniqueCopyName = (name: string) => {
  // Generate a random UUID and take the first 8 characters to keep it short
  const uniqueId = randomUUID().substring(0, 8)
  return `${name} (${uniqueId})`
}

export default uniqueCopyName
