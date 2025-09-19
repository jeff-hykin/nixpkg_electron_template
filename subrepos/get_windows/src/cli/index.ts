#!/usr/bin/env node

import { interactive } from './interactive.ts'
import { nonInteractive } from './non-interactive.ts'

import { FileSystem } from "https://deno.land/x/quickr@0.8.4/main/file_system.js"
import { parseArgs, flag, required, initialValue } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/parse_args.js"
import { toCamelCase } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/to_camel_case.js"
import { didYouMean } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/did_you_mean.js"

// 
// hack in an option for partial interactivity
// 
    const output = parseArgs({
        rawArgs: Deno.args,
        fields: [
            [[ "--downloadTargetPath",], ],
        ],
        nameTransformer: toCamelCase,
        namedArgsStopper: "--",
        nameRepeats: "useLast",
        valueTransformer: JSON.parse,
        isolateArgsAfterStopper: false,
        argsByNameSatisfiesNumberedArg: true,
        implicitNamePattern: /^(--|-)[a-zA-Z0-9\-_]+$/,
        implictFlagPattern: null,
    })
    const {
        downloadTargetPath,
    } = output.simplifiedNames


if (process.argv.length <= 2 || downloadTargetPath) {
  interactive({downloadTargetPath})
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
