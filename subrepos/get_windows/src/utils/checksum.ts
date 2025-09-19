import fs from 'node:fs'
import crypto from 'node:crypto'

export const getFileHash = async (filePath: string, algorithm = 'sha256'): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash(algorithm)
    const stream = fs.createReadStream(filePath)

    stream.on('data', (chunk) => {
      hash.update(chunk)
    })

    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}
