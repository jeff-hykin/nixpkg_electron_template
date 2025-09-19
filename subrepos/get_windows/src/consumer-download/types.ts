export interface ValidationContainer {
  ErrorList: any[]
  Errors: any[]
}

// Language SKU table
export interface LanguageSkuIdTable {
  Skus: Sku[]
  ValidationContainer: ValidationContainer
  Tickets: any
}

export interface Sku {
  Id: string
  Description: string
  ProductDisplayName: string
  Language: string
  LocalizedLanguage: string
  LocalizedProductDisplayName: string
  ProductEditionName: any
  FriendlyFileNames: string[]
}

// Product download link
export interface ProductDownload {
  ProductDownloadOptions: ProductDownloadOption[]
  ProductDownload: any
  ValidationContainer: ValidationContainer
  DownloadExpirationDatetime: string
}

export interface ProductDownloadOption {
  Name: string
  Uri: string
  ProductDisplayName: string
  Language: string
  LocalizedProductDisplayName: string
  LocalizedLanguage: string
  DownloadType: number
}
