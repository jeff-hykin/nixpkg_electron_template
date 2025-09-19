import cliProgress from 'cli-progress'
import prettyBytes from 'pretty-bytes'
import { type DownloadProgress } from '../types'

export default class ProgressBar {
  progressBar: cliProgress.SingleBar

  constructor() {
    this.progressBar = new cliProgress.SingleBar({
      format: '{bar} {percentage}% | ETA: {customEta} | Speed: {speed} | {progress}'
    }, cliProgress.Presets.shades_classic)

    this.progressBar.start(100, 0, {
      customEta: 'N/A',
      speed: 'N/A',
      progress: '0 / 0'
    })
  }

  update(progress: DownloadProgress) {
    this.progressBar.update(progress.percentage, {
      customEta: progress.formattedEta,
      speed: prettyBytes(progress.speed),
      progress: `${prettyBytes(progress.downloaded)} / ${prettyBytes(progress.total)}`
    })

    if (progress.percentage === 100) {
      this.progressBar.stop()
    }
  }
}
