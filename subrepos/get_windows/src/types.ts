export interface LinkProgress {
  type: 'generating-download-link'
}

export interface DownloadProgress {
  type: 'download'
  percentage: number
  downloaded: number
  total: number
  speed: number
  eta: number
  formattedEta: string
}

export interface ChecksumProgress {
  type: 'checksum'
}

export type Progress = LinkProgress | DownloadProgress | ChecksumProgress
