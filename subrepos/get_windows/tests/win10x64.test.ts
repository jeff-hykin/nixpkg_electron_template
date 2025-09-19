import fs from 'node:fs'
import path from 'node:path'
import { describe, test, beforeAll } from 'https://esm.sh/vitest@3.2.4'
import { download } from '../src/index.ts'

describe('Win10x64', () => {
  const directory = path.join(process.cwd(), 'test-downloads')

  // Ensure the test-downloads directory exists
  beforeAll(() => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory)
    }
  })

  test('download', async () => {
    await download({
      version: 'win11x64',
      language: 'English (United States)',
      directory: ''
    })
  })
})
