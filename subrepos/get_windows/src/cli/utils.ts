/**
 * Helper functions for the CLI
 */

import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'


interface Choice {
  name: string
  value: string
  description?: string
}

// Function to get paths based on the user's OS
const getUserDirectory = (type?: 'desktop' | 'documents' | 'downloads') => {
  const homeDir = os.homedir()

  // Function to get XDG directory if defined
  const getXdgDirectory = (envVar: string, fallback: string) => {
    const dir = process.env[envVar]
    return dir && fs.existsSync(dir) ? dir : path.join(homeDir, fallback)
  }

  switch (type) {
    case 'desktop':
      if (process.platform === 'linux') {
        return getXdgDirectory('XDG_DESKTOP_DIR', 'Desktop')
      }

      return path.join(homeDir, 'Desktop')
    case 'documents':
      if (process.platform === 'linux') {
        return getXdgDirectory('XDG_DOCUMENTS_DIR', 'Documents')
      }

      return path.join(homeDir, 'Documents')
    case 'downloads':
      if (process.platform === 'linux') {
        return getXdgDirectory('XDG_DOWNLOAD_DIR', 'Downloads')
      }

      return path.join(homeDir, 'Downloads')
    default:
      return homeDir
  }
}

export const getDownloadLocationChoices = (): Choice[] => {
  return [
    {
      name: 'Current directory',
      value: process.cwd(),
      description: process.cwd()
    },
    {
      name: 'Downloads',
      value: getUserDirectory('downloads'),
      description: getUserDirectory('downloads')
    },
    {
      name: 'Documents',
      value: getUserDirectory('documents'),
      description: getUserDirectory('documents')
    },
    {
      name: 'Desktop',
      value: getUserDirectory('desktop'),
      description: getUserDirectory('desktop')
    },
    {
      name: 'Home directory',
      value: getUserDirectory(),
      description: getUserDirectory()
    },
    {
      name: 'Custom directory',
      value: 'custom'
    }
  ]
}
