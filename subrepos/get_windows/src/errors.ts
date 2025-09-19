export class WinIsoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WinIsoError'
  }
}

export class WinIsoValidationError extends WinIsoError {
  constructor(message: string) {
    super(message)
    this.name = 'WinIsoValidationError'
  }
}

export class WinIsoNetworkError extends WinIsoError {
  constructor(message: string) {
    super(message)
    this.name = 'WinIsoNetworkError'
  }
}

export class WinIsoRateLimitError extends WinIsoError {
  constructor(message: string) {
    super(message)
    this.name = 'WinIsoNetworkError'
  }
}

export class WinIsoChecksumError extends WinIsoError {
  path: string

  constructor(message: string, path: string) {
    super(message)
    this.name = 'WinIsoChecksumError'
    this.path = path
  }
}
