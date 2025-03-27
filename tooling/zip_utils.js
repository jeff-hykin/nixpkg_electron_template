#!/usr/bin/env -S deno run --allow-all
import { BlobReader, BlobWriter, TextReader, TextWriter, ZipReader, ZipWriter } from "https://esm.sh/jsr/@zip-js/zip-js"

/**
 * Creates a zip blob from an object containing file paths and their content.
 * @example
 * ```js
 * const zipArrayBuffer = await createZipBlob({
 *     'folder1/hello.txt': 'Hello world!',
 *     'folder2/data.bin': new Uint8Array([1, 2, 3, 4, 5]),
 *     'folder3/': [] // Represents a directory (must be empty)
 * })
 * ```
 * @param {Object} files - An object where keys are file paths and values are either strings, Uint8Arrays, or empty arrays for directories.
 * @returns {Promise<ArrayBuffer>} A promise that resolves to the zip blob as an ArrayBuffer.
 */
export async function createZipBlob(files) {
    const zipFileWriter = new BlobWriter()
    const zipWriter = new ZipWriter(zipFileWriter)

    for (const [filePath, content] of Object.entries(files)) {
        if (Array.isArray(content) && content.length === 0) {
            // Handle directory
            await zipWriter.add(filePath, null, { directory: true })
        } else if (typeof content === "string") {
            const textReader = new TextReader(content)
            await zipWriter.add(filePath, textReader)
        } else if (content instanceof Uint8Array) {
            const blobReader = new BlobReader(new Blob([content]))
            await zipWriter.add(filePath, blobReader)
        }
    }

    await zipWriter.close()
    return zipFileWriter.getData().then((data) => data.arrayBuffer())
}

/**
 * Extracts content from a zip file and returns an object with file paths as keys and their content as values.
 * @example
 * ```js
 * const zipData = new Uint8Array([1, 2, 3, 4, 5])
 * const content = await extractZipContent(zipData)
 * console.log(content)
 * ```
 * @param {Uint8Array} zipData - The zip file data as a Uint8Array.
 * @returns {Promise<Object>} A promise that resolves to an object where keys are file paths and values are either Uint8Arrays for files or empty arrays for directories.
 */
export async function extractZipContent(zipData) {
    const zipFileReader = new BlobReader(new Blob([zipData]))
    const zipReader = new ZipReader(zipFileReader)
    const entries = await zipReader.getEntries()
    const result = {}

    for (const entry of entries) {
        if (entry.directory) {
            result[entry.filename] = []
        } else {
            const blobWriter = new BlobWriter()
            const content = await entry.getData(blobWriter)
            const arrayBuffer = await content.arrayBuffer()
            result[entry.filename] = new Uint8Array(arrayBuffer)
        }
    }

    await zipReader.close()
    return result
}