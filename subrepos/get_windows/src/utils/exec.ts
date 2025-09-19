import { exec as old } from 'child_process'
import { promisify } from 'util'

export const exec = promisify(old)
