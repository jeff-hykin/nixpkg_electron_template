import fs from 'node:fs'
import fsAsync from 'node:fs/promises'
import { select, input } from '../inquirer/prompts'
import ora, { type Ora } from 'ora'
import { download } from '../index'
import { WinIsoChecksumError } from '../errors'
import languages from '../consumer-download/languages'
import ProgressBar from './ProgressBar'
import { getDownloadLocationChoices } from './utils'
import { options } from './download-options'

export const interactive = async () => {
  if (process.env.WIN_ISO_DEV === 'true') {
    console.log('Dev mode enabled')
  }

  const chosenVersionKey = await select({
    message: 'Select a version of Windows to download',
    choices: options.map(x => ({ name: x.displayName, value: x.version }))
  })

  const chosenVersion = options.find(x => x.version === chosenVersionKey)
  if (!chosenVersion) {
    console.error(`Invalid key: ${chosenVersionKey}. Use 'list' command to see available options.`)
    process.exit(1)
  }

  const language = await select({
    message: 'Select the language of the Windows ISO',
    default: 'English (United States)',
    choices: languages.map(x => ({ name: x, value: x }))
  })

  let downloadLocation = await select({
    message: 'Select where to save the downloaded ISO file',
    choices: getDownloadLocationChoices()
  })

  if (downloadLocation === 'custom') {
    const customLocation = await input({
      message: 'Enter the custom directory to save the downloaded ISO file'
    })
    downloadLocation = customLocation
  }

  / Validate the download location
  if (!fs.existsSync(downloadLocation)) {
    console.error(`Error: Download location ${downloadLocation} does not exist`)
    process.exit(1)
  }

  / Seperator
  console.log('')

  const genLinkSpinner = ora('Generating download link...').start()
  let progressBar: ProgressBar | undefined
  let checksumSpinner: Ora | undefined

  try {
    const path = await download({
      version: chosenVersion.version,
      directory: downloadLocation,
      language,
      onProgress: (progress) => {
        if (progress.type === 'download') {
        / If the progress bar has not been created yet, create it
        / and stop the gen link spinner
          if (!progressBar) {
            genLinkSpinner.succeed('Download link generated!')
            console.log('Downloading...')
            progressBar = new ProgressBar()
          }

          progressBar.update(progress)
        } else if (progress.type === 'checksum') {
          checksumSpinner = ora('Verifying checksum...').start()
        }
      }
    })

    if (checksumSpinner) {
      checksumSpinner.succeed('Checksum verified!')
    }

    console.log(`\nDownloaded: ${path}`)
  } catch (error) {
    if (error instanceof WinIsoChecksumError) {
      / Checksum verification failed, delete the downloaded file
      if (error.path) {
        await fsAsync.unlink(error.path)
      }
      checksumSpinner?.fail('Checksum verification failed. Deleted downloaded file. Please try again. If the checksum verification continues to fail, please open an issue at https:/github.com/kyleaupton/win-iso/issues.')
    }
  }
}
