/**
 * Valid languages for the consumer download. These are
 * the same between Windows 10 and Windows 11.
 * These are the `LocalizedLanguage` values, comparing
 * on the innter HTML of the `option` elements should work.
 */

const languages = [
  'Arabic',
  'Brazilian Portuguese',
  'Bulgarian',
  'Chinese Simplified',
  'Chinese Traditional',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English (United States)',
  'English International',
  'Estonian',
  'Finnish',
  'French',
  'French Canadian',
  'German',
  'Greek',
  'Hebrew',
  'Hungarian',
  'Italian',
  'Japanese',
  'Korean',
  'Latvian',
  'Lithuanian',
  'Norwegian',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Serbian Latin',
  'Slovak',
  'Slovenian',
  'Spanish',
  'Spanish (Mexico)',
  'Swedish',
  'Thai',
  'Turkish',
  'Ukrainian'
] as const

export type Language = typeof languages[number]

export default languages
