import fs from 'node:fs'
import fsAsync from 'node:fs/promises'
import path from 'node:path'
import { Command, Option } from 'npm:commander' /* CHECKME: file(s) didn't exist, assuming npm */
import chalk from 'npm:chalk' /* CHECKME: file(s) didn't exist, assuming npm */
import ora, { type Ora } from 'npm:ora' /* CHECKME: file(s) didn't exist, assuming npm */
import { download } from '../index.ts'
import { WinIsoChecksumError } from '../errors.ts'
import languages, { type Language } from '../consumer-download/languages.ts'
import ProgressBar from './ProgressBar.ts'
import { options } from './download-options.ts'

export const nonInteractive = async () => {
  if (process.env.WIN_ISO_DEV === 'true') {
    console.log('Dev mode enabled')
  }

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../..', 'package.json'), 'utf-8')
  )
  const program = new Command()

  program
    .name('win-iso')
    .description('A CLI tool to download Windows ISO files')
    .version(packageJson.version, '-v, --version', 'Display version number')
    .helpOption(undefined, 'Display help')
    .helpCommand('help [command]', 'Display help for command')

  program
    .command('list')
    .description('List all available download options')
    .action(() => {
      console.log('Available download options:\n')

      // Header
      console.log(`${chalk.bold.underline('Key')}\t\t${chalk.bold.underline('Display Name')}`)

      // Data
      options.forEach((option) => {
        console.log(`${option.version}\t${option.displayName}`)
      })
    })

  program
    .command('languages')
    .description('List all available languages for Windows 10 and 11')
    .action(() => {
      console.log('Available languages:\n')

      languages.forEach((language) => {
        console.log(language)
      })
    })

  program
    .command('download')
    .argument('<key>', 'The key of the windows version to download')
    .addOption(new Option('-d, --directory <path>', 'The directory to save the downloaded ISO in'))
    .addOption(new Option('-n, --name <name>', 'The output name for the downloaded file').conflicts('-d, --directory'))
    .addOption(new Option('-l, --language <language>', 'The language of the Windows ISO').default('English (United States)'))
    .description('Download the specified windows version')
    .action(async (key, { name, directory, language }: { name?: string, directory: string, language: Language }) => {
      // Validate location exists if provided
      if (directory && !fs.existsSync(directory)) {
        console.error(`Error: Download location ${directory} does not exist`)
        process.exit(1)
      }

      // Validate language
      if (!languages.includes(language)) {
        console.error(`Invalid language: ${language}. Use 'languages' command to see available options.`)
        process.exit(1)
      }

      // Validate key
      const option = options.find(x => x.version === key)
      if (!option) {
        console.error(`Invalid key: ${key}. Use 'list' command to see available options.`)
        process.exit(1)
      }

      const genLinkSpinner = ora('Generating download link...').start()
      let progressBar: ProgressBar | undefined
      let checksumSpinner: Ora | undefined

      try {
        const path = await download({
          version: option.version,
          name,
          directory: directory || process.cwd(),
          language,
          onProgress: (progress) => {
            if (progress.type === 'download') {
            // If the progress bar has not been created yet, create it
            // and stop the gen link spinner
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

        console.log(`Downloaded: ${path}`)
      } catch (error) {
        console.log(error)
        if (error instanceof WinIsoChecksumError) {
          // Checksum verification failed, delete the downloaded file
          if (error.path) {
            await fsAsync.unlink(error.path)
          }
          checksumSpinner?.fail('Checksum verification failed. Deleted downloaded file. Please try again. If the checksum verification continues to fail, please open an issue at https://github.com/kyleaupton/win-iso/issues.')
        }
      }
    })

  await program.parseAsync(process.argv)
}
