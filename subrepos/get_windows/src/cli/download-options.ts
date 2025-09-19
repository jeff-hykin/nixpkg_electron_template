import { type DownloadOptions } from '..'

type Version = DownloadOptions['version']

interface DownloadOption {
  version: Version
  displayName: string
}

export const options: DownloadOption[] = [
  { version: 'win11x64', displayName: 'Windows 11 64-bit' },
  { version: 'win10x64', displayName: 'Windows 10 64-bit' },
  { version: 'win10x32', displayName: 'Windows 10 32-bit' }
]
