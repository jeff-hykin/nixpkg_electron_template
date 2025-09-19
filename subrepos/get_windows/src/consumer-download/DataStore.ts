import fs from 'node:fs/promises'
import path from 'node:path'
import { parse as parseHtml, type HTMLElement } from 'https://esm.sh/node-html-parser@7.0.1'
import { request } from './request.ts'
import { type LanguageSkuIdTable, type ProductDownload } from './types.ts'


interface DataRetrievalStrategy {
  mainDownloadPage: () => Promise<HTMLElement>
  languageSkuIdTable: (sessionId: string, productEditionId: string) => Promise<LanguageSkuIdTable>
  productDownloadOptions: (sessionId: string, skuId: string) => Promise<ProductDownload>
}

export class DebugStrategy implements DataRetrievalStrategy {
  private readonly version: 10 | 11

  constructor(version: 10 | 11) {
    this.version = version
  }

  private _getSampleDataPath(name: string) {
    return path.resolve('src', 'consumer-download', 'sample-data', `windows-${this.version}`, name)
  }

  async mainDownloadPage(): Promise<HTMLElement> {
    const html = await fs.readFile(this._getSampleDataPath('mainDownloadPage.html'), { encoding: 'utf-8' })
    return parseHtml(html)
  }

  async languageSkuIdTable(): Promise<LanguageSkuIdTable> {
    const json = await fs.readFile(this._getSampleDataPath('languageSkus.json'), { encoding: 'utf-8' })
    return JSON.parse(json)
  }

  async productDownloadOptions(): Promise<ProductDownload> {
    const json = await fs.readFile(this._getSampleDataPath('productDownloadLink.json'), { encoding: 'utf-8' })
    return JSON.parse(json)
  }
}

export class ProductionStrategy implements DataRetrievalStrategy {
  private readonly version: 10 | 11
  private readonly url: string

  constructor(version: 10 | 11) {
    this.version = version
    this.url = `https://www.microsoft.com/en-us/software-download/windows${version}`
    if (this.version === 10) this.url = `${this.url}ISO`
  }

  async mainDownloadPage(): Promise<HTMLElement> {
    const response = await request({ url: this.url, method: 'GET' })
    return parseHtml(response.data)
  }

  async languageSkuIdTable(sessionId: string, productEditionId: string): Promise<LanguageSkuIdTable> {
    const { data } = await request({
      method: 'GET',
      url: 'https://www.microsoft.com/software-download-connector/api/getskuinformationbyproductedition',
      headers: {
        Referer: this.url
      },
      params: {
        profile: '606624d44113',
        ProductEditionId: productEditionId,
        SKU: undefined,
        friendlyFileName: undefined,
        Locale: 'en-US',
        sessionID: sessionId
      }
    })

    return data
  }

  async productDownloadOptions(sessionId: string, skuId: string): Promise<ProductDownload> {
    const res = await request({
      method: 'GET',
      url: 'https://www.microsoft.com/software-download-connector/api/GetProductDownloadLinksBySku',
      headers: {
        Referer: this.url
      },
      params: {
        profile: '606624d44113',
        ProductEditionId: undefined,
        SKU: skuId,
        friendlyFileName: undefined,
        Locale: 'en-US',
        sessionID: sessionId
      }
    })

    // console.log(res)

    return res.data
  }
}

export class DataStore {
  private readonly strategy: DataRetrievalStrategy

  constructor(strategy: DataRetrievalStrategy) {
    this.strategy = strategy
  }

  async mainDownloadPage(): Promise<HTMLElement> {
    return await this.strategy.mainDownloadPage()
  }

  async languageSkuIdTable(sessionId: string, productEditionId: string): Promise<LanguageSkuIdTable> {
    return await this.strategy.languageSkuIdTable(sessionId, productEditionId)
  }

  async productDownloadOptions(sessionId: string, skuId: string): Promise<ProductDownload> {
    return await this.strategy.productDownloadOptions(sessionId, skuId)
  }
}
