import { type Progress } from './types.ts'
import { type Language } from './consumer-download/languages.ts'
import { consumerDownload } from './consumer-download/index.ts'

export interface BaseDownloadOptions {
  directory: string
  name?: string
  onProgress?: (progress: Progress) => void
}

export interface Win10x32Options extends BaseDownloadOptions {
  version: 'win10x32'
  language: Language
}

export interface Win10x64Options extends BaseDownloadOptions {
  version: 'win10x64'
  language: Language
}

export interface Win11x64Options extends BaseDownloadOptions {
  version: 'win11x64'
  language: Language
}

export type DownloadOptions = Win10x32Options | Win10x64Options | Win11x64Options

interface DownloadStrategy<T extends BaseDownloadOptions> {
  download: (options: T) => Promise<string>
}

class Win10x32DownloadStrategy implements DownloadStrategy<Win10x32Options> {
  async download(options: Win10x32Options) {
    return await consumerDownload({
      version: 10,
      architecture: 'x32',
      directory: options.directory,
      name: options.name,
      language: options.language,
      onProgress: options.onProgress
    })
  }
}

class Win10x64DownloadStrategy implements DownloadStrategy<Win10x64Options> {
  async download(options: Win10x64Options) {
    return await consumerDownload({
      version: 10,
      architecture: 'x64',
      directory: options.directory,
      name: options.name,
      language: options.language,
      onProgress: options.onProgress
    })
  }
}

class Win11x64DownloadStrategy implements DownloadStrategy<Win11x64Options> {
  async download(options: Win11x64Options) {
    return await consumerDownload({
      version: 11,
      directory: options.directory,
      name: options.name,
      language: options.language,
      onProgress: options.onProgress
    })
  }
}

const getDownloadStrategy = (options: DownloadOptions): DownloadStrategy<any> => {
  switch (options.version) {
    case 'win10x32':
      return new Win10x32DownloadStrategy()
    case 'win10x64':
      return new Win10x64DownloadStrategy()
    case 'win11x64':
      return new Win11x64DownloadStrategy()
  }
}

export async function download(options: DownloadOptions): Promise<string> {
  const strategy = getDownloadStrategy(options)
  return await strategy.download(options)
}
