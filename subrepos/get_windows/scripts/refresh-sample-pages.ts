/**
 * Refreshes the sample pages in the `sample-pages` directory.
 * Keep in mind the ISO edition + language SKU are hardcoded in the script.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { v4 as uuidv4 } from 'npm:uuid' /* CHECKME: file(s) didn't exist, assuming npm */
import { DataStore } from '../src/consumer-download/DataStore.ts'
import { request } from '../src/consumer-download/request.ts'

const _dirname = path.dirname(url.fileURLToPath(import.meta.url))
const samplePagesDir = path.resolve(_dirname, '..', 'src', 'sample-pages')
const windows10Dir = path.resolve(samplePagesDir, 'windows-10')
const windows11Dir = path.resolve(samplePagesDir, 'windows-11')

const windows10Url = 'https://www.microsoft.com/en-us/software-download/windows10ISO'
const windows11Url = 'https://www.microsoft.com/en-us/software-download/windows11'

// Set debug to false so the actual pages are downloaded
// We will need to do this for both windows 10 and 11
const dataStore = new DataStore(false)

//
// Windows 10
//

// // Get the main download page
// const mainDownloadPage10 = await dataStore.mainDownloadPage({ url: windows10Url })
// await fs.writeFile(path.join(windows10Dir, 'mainDownloadPage.html'), mainDownloadPage10.toString())

// // Create session
// const sessionId = uuidv4()
// await request({
//   url: `https://vlscppe.microsoft.com/tags?org_id=y6jn8c31&session_id=${sessionId}`
// })

// // Get the language SKU ID table
// const urlSegmentParameter = windows10Url.split('/').pop() as string
// const languageSkuIdTable = await dataStore.languageSkuIdTable({
//   sessionId,
//   urlSegmentParameter,
//   productEditionId: '2618'
// })
// await fs.writeFile(path.join(windows10Dir, 'skuId.html'), languageSkuIdTable.toString())

// const isoDownloadPage = await dataStore.isoDownloadPage({
//   sessionId,
//   urlSegmentParameter,
//   skuId: '16067',
//   url: windows10Url
// })
// await fs.writeFile(path.join(windows10Dir, 'isoDownloadPage.html'), isoDownloadPage.toString())

//
// Windows 11
//

// Get the main download page
const mainDownloadPage11 = await dataStore.mainDownloadPage({ url: windows11Url })
await fs.writeFile(path.join(windows11Dir, 'mainDownloadPage.html'), mainDownloadPage11.toString())

// Create session
const sessionId = uuidv4()
await request({
  url: `https://vlscppe.microsoft.com/tags?org_id=y6jn8c31&session_id=${sessionId}`
})

// Get the language SKU ID table
const urlSegmentParameter = windows11Url.split('/').pop() as string
const languageSkuIdTable = await dataStore.languageSkuIdTable({
  sessionId,
  urlSegmentParameter,
  productEditionId: '2935'
})
await fs.writeFile(path.join(windows11Dir, 'skuId.html'), languageSkuIdTable.toString())

const isoDownloadPage = await dataStore.isoDownloadPage({
  sessionId,
  urlSegmentParameter,
  skuId: '17442',
  url: windows11Url
})
await fs.writeFile(path.join(windows11Dir, 'isoDownloadPage.html'), isoDownloadPage.toString())
