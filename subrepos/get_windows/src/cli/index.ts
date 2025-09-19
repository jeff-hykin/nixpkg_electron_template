#!/usr/bin/env node

import { interactive } from './interactive'
import { nonInteractive } from './non-interactive'

if (process.argv.length <= 2) {
  interactive()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
} else {
  nonInteractive()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
