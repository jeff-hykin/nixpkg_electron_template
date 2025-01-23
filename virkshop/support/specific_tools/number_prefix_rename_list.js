import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.66/main/file_system.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@0.7.18/math.js"
import { zip } from "https://deno.land/x/good@0.7.18/array.js"

export function numberPrefixRenameList(filepaths) {
    let largestNumber = -Infinity
    const items = []
    const basenames = filepaths.map(eachPath=>FileSystem.basename(eachPath))
    for (const each of basenames) {
        const matchData = each.match(/^((?:[0-9_]*[0-9])?)_?(.*)/)
        const digits = matchData[1].replace(/_/g, "")
        const name = matchData[2]
        const number = `${digits || 0}`-0
        const padding = digits.match(/^0*/)[0]
        items.push({
            name,
            number,
            padding,
            noDigits: digits.length == 0,
        })
        if (number > largestNumber) {
            largestNumber = number
        }
    }
    const numberOfDigits = `${largestNumber}`.length
    const roundedToNearestThree = roundedUpToNearest({value: numberOfDigits, factor: 3})
    const newBasenames = []
    for (const each of items) {
        if (each.noDigits) {
            newBasenames.push(each.name)
        } else {
            const newDigits = `${each.padding}${each.number}`.padEnd(roundedToNearestThree, "0")
            const newPrefix = newDigits.replace(/(\d\d\d)/g, "$1_")
            newBasenames.push(`${newPrefix}${each.name}`)
        }
    }
    const thingsToRename = []
    for (const [ path, oldBasename, newBasename, item] of zip(filepaths, basenames, newBasenames, items)) {
        if (oldBasename != newBasename) {
            thingsToRename.push({
                oldPath: path,
                newPath: `${FileSystem.parentPath(path)}/${newBasename}`,
            })
        }
    }
    return thingsToRename
}