import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { WinIsoNetworkError } from '@/errors'

const jar = new CookieJar()
const clinet = wrapper(axios.create({ jar }))

const defaultHeaders = {
  accept: 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'en-US,en;q=0.9,de;q=0.8,la;q=0.7',
  priority: 'u=1, i',
  'request-context': 'appId=cid-v1:appId',
  'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'x-requested-with': 'XMLHttpRequest',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
}

export const request = async (options: AxiosRequestConfig) => {
  // Set user agent
  options.headers = { ...defaultHeaders, ...options.headers }

  try {
    return await clinet(options)
  } catch (error) {
    console.log('')
    console.log(error)

    if (error instanceof AxiosError) {
      throw new WinIsoNetworkError(error.message)
    }

    throw new WinIsoNetworkError('Unknown network error')
  }
}
