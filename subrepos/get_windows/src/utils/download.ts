import { createWriteStream } from 'node:fs'
import https from 'node:https'
import { type DownloadProgress } from '../types.ts'


interface DownloadFileOptions {
  url: string
  filePath: string
  isDev?: boolean
  onProgress?: (progress: DownloadProgress) => void
}

export const downloadFile = async (options: DownloadFileOptions) => {
  if (options.isDev) {
    await simulateDownload(options)
  } else {
    await realDownload(options)
  }
}

const realDownload = async ({
  url,
  filePath,
  onProgress
}: DownloadFileOptions) => {
  const file = createWriteStream(filePath)
  const startTime = Date.now()

  await new Promise<void>((resolve, reject) => {
    https.get(url, response => {
      const total = parseInt(response.headers['content-length'] ?? '0', 10)
      let downloaded = 0

      response.pipe(file)

      response.on('data', chunk => {
        downloaded += chunk.length

        // Calculate elapsed time
        const elapsedTime = (Date.now() - startTime) / 1000 // in seconds

        // Calculate progress
        const percentage = (downloaded / total) * 100
        const speed = (downloaded / elapsedTime) // speed in bytes/s
        const remaining = total - downloaded
        const eta = (remaining / speed) || 0 // estimated time in seconds
        const formattedEta = new Date(eta * 1000).toISOString().substr(11, 8) // format as hh:mm:ss

        // Create the progress object
        const progress: DownloadProgress = {
          type: 'download',
          percentage,
          downloaded,
          total,
          speed,
          eta: Math.round(eta),
          formattedEta
        }

        if (onProgress) {
          onProgress(progress)
        }
      })

      file.on('finish', () => {
        file.close()
        resolve()
      })

      file.on('error', (err) => {
        file.close()
        reject(err)
      })
    })
  })
}

const simulateDownload = async ({
  onProgress
}: DownloadFileOptions) => {
  const totalSize = 1024 * 1024 * 5 // Simulate a 5MB file for example
  // const downloadSpeed = 1024 * 100 // Simulate 100KB/s speed
  const downloadSpeed = 1024 * 200 // Simulate 200KB/s speed
  // const downloadSpeed = 1024 * 1024 // Simulate 1MB/s speed
  const interval = 1000 // Update every 1 second

  let downloaded = 0

  await new Promise<void>((resolve) => {
    const downloadInterval = setInterval(() => {
      downloaded += downloadSpeed

      if (downloaded >= totalSize) {
        downloaded = totalSize
      }

      const percentage = (downloaded / totalSize) * 100
      const remaining = totalSize - downloaded
      const eta = remaining / downloadSpeed // Estimated time remaining in seconds
      const formattedEta = new Date(eta * 1000).toISOString().substr(11, 8) // Format as hh:mm:ss

      const progress: DownloadProgress = {
        type: 'download',
        percentage,
        downloaded,
        total: totalSize,
        speed: downloadSpeed,
        eta: Math.round(eta),
        formattedEta
      }

      if (onProgress) {
        onProgress(progress)
      }

      if (downloaded >= totalSize) {
        clearInterval(downloadInterval)
        resolve()
      }
    }, interval)
  })
}
