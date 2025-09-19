import path from 'node:path'
import { parse as parseHtml } from 'https://esm.sh/node-html-parser@7.0.1'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@13.0.0'
import { WinIsoChecksumError, WinIsoRateLimitError } from '../errors.ts'
import { downloadFile } from '../utils/download.ts'
import { getFileHash } from '../utils/checksum.ts'
import { type Progress } from '../types.ts'
import { DataStore, ProductionStrategy, DebugStrategy } from './DataStore.ts'
import { request } from './request.ts'
import { type Language } from './languages.ts'


interface ConsumerDownloadOptionsBase {
  language: Language
  directory: string
  name?: string
  onProgress?: (progress: Progress) => void
}

interface DownloadWindows10Options extends ConsumerDownloadOptionsBase {
  version: 10
  architecture: 'x32' | 'x64'
}

interface DownloadWindows11Options extends ConsumerDownloadOptionsBase {
  version: 11
}

type DownloadOptions = DownloadWindows10Options | DownloadWindows11Options

const isWindows10Options = (options: DownloadOptions): options is DownloadWindows10Options => {
  return options.version === 10
}

export const consumerDownload = async (options: DownloadOptions) => {
  options.onProgress?.({ type: 'generating-download-link' })

  const IS_DEV = process.env.WIN_ISO_DEV === 'true'

  const strategy = IS_DEV
    ? new DebugStrategy(options.version)
    : new ProductionStrategy(options.version)

  const dataStore = new DataStore(strategy)

  //
  // Get ISO edition ID
  //
  const mainDownloadPage = await dataStore.mainDownloadPage()

  // First we need to get the product edition select element
  const select = mainDownloadPage.getElementById('product-edition')
  if (!select) {
    throw Error('Product edition select element was not found')
  }

  // Next we need to find the first option that is not null
  // There should only be one option that is not null
  const productEdition = select
    .querySelectorAll('option')
    .find((option) => option.getAttribute('value') !== 'null')
    ?.getAttribute('value')

  if (!productEdition) {
    throw Error('Product edition option was not found')
  }

  //
  // Create session
  //
  const sessionId = uuidv4()

  if (!IS_DEV) {
    await request({
      method: 'GET',
      url: 'https://vlscppe.microsoft.com/tags',
      params: {
        org_id: 'y6jn8c31',
        session_id: sessionId
      }
    })
  }

  //
  // Get SKU from language
  //
  const { Skus } = await dataStore.languageSkuIdTable(sessionId, productEdition)
  const sku = Skus.find((sku) => sku.LocalizedLanguage === options.language)

  if (!sku) {
    throw Error(`SKU for ${options.language} was not found`)
  }

  //
  // Get ISO download link
  //
  const { ProductDownloadOptions } = await dataStore.productDownloadOptions(sessionId, sku.Id)
  /**
   * If the above request fails, the response will look like this:
   * {
   *   Errors: [
   *     {
   *       Key: 'ErrorSettings.SentinelReject',
   *       Value: 'Sentinel marked this request as rejected.',
   *       Type: 9
   *     }
   *   ]
   * }
   *
   * We can assume that if there's no `ProductDownloadOptions` key
   * then it's no good. As far as why this happens, I'm not sure.
   * I think it has something to do with the session being
   * invalid. I'm not sure if it's related to a rate limit
   * or invalid request headers. It's worth noting I'm not
   * sending a cookie that the browser would normally send.
   * For now I'll assume it's a rate limit and throw an error.
   */
  if (!ProductDownloadOptions) {
    throw new WinIsoRateLimitError('Rate limit exceeded')
  }

  const downloadType = isWindows10Options(options) && options.architecture === 'x32' ? 0 : 1
  const downloadOption = ProductDownloadOptions.find((option) => option.DownloadType === downloadType)

  if (!downloadOption) {
    throw Error('Download option was not found')
  }

  //
  // Get checkum hash
  //
  // Because of some malformed HTML we need to extract the table manually
  const table = mainDownloadPage.toString().match(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)
  if (!table) {
    throw Error('Checkum table was not found')
  }

  const checksumTable = parseHtml(table[0])

  const getChecksumByLanguage = (language: string): string | null => {
    const rows = checksumTable.querySelectorAll('tr')

    for (const row of rows) {
      const columns = row.querySelectorAll('td')
      if (columns.length >= 2) {
        const langText = columns[0].text.trim() // First <td> has the language
        const checksumText = columns[1].text.trim() // Second <td> has the checksum

        if (langText === language) {
          return checksumText // Return the checksum if the language matches
        }
      }
    }

    return null // Return null if the language is not found
  }

  const arch = isWindows10Options(options) && options.architecture === 'x32' ? '32-bit' : '64-bit'
  const checksumTarget = `${downloadOption.Language} ${arch}`
  const checksum = getChecksumByLanguage(checksumTarget)

  if (!checksum) {
    throw Error(`Checksum for ${checksumTarget} was not found`)
  }

  //
  // Download ISO
  //
  const { pathname } = new URL(downloadOption.Uri)
  const filename = options.name || path.basename(pathname) // eslint-disable-line
  const filePath = path.resolve(options.directory, filename)

  await downloadFile({
    url: downloadOption.Uri,
    filePath,
    isDev: IS_DEV,
    onProgress: options.onProgress
  })

  //
  // Perform checksum verification
  //
  options.onProgress?.({ type: 'checksum' })
  if (!IS_DEV) {
    // A file is only created if dev mode is disabled
    const fileHash = await getFileHash(filePath)

    if (fileHash.toLowerCase() !== checksum.toLowerCase()) {
      throw new WinIsoChecksumError('Checksum verification failed', filePath)
    }
  } else {
    // If dev mode is enabled we
    // will just wait a few seconds
    // so the CLI can be tested
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  return filePath
}
