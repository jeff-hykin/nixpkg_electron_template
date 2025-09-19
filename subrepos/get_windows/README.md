# win-iso

[![NPM version](https://img.shields.io/npm/v/@kyleupton/glob-copy.svg?style=flat)](https://www.npmjs.com/package/@kyleupton/win-iso)

## Overview

This library provides a simple way to download Windows ISO images from Microsoft. It is designed to be used as a CLI tool or as a Node.js API.


## Features

- Download Windows 10 x32 and x64, and Windows 11 x64
- Interactive CLI
- Non-interactive CLI
- Node.js API
- Checksum verification
- Download progress
- Supports all languages available on the Microsoft website

## Inspiration

This library was heavily influenced by [Mido](https://github.com/ElliotKillick/Mido), a Microsoft image download client written in bash.

## CLI

### Installation

For CLI usage, install the package globally:

```bash
npm i -g @kyleupton/win-iso
```

### CLI Usage

You can use the CLI tool interactively or non-interactively by passing arguments.

#### Interactive

Simply run the following command to start the interactive CLI:

```bash
win-iso
```

#### Non-Interactive

First list the available download options:

```bash
win-iso list
```

Then download a specified version:

```bash
win-iso download win10x64
```

You can also specify the download directory, ISO file name, and the language. For more information, run:

```bash
win-iso download --help
```

## API

### Installation

For API usage, install the package as a dependency:

```bash
npm i @kyleupton/win-iso
```

### API Usage

```typescript
import { download } from '@kyleupton/win-iso'

const filePath = await download({
  version: 'win10x64',
  directory: '/path/to/save',
  language: 'English (United States)'
})
```

## Constraints

Please be aware that Microsoft has implemented measures to discourage the automated downloading of Windows ISO images. This tool, as a result, is subject to these restrictions. Excessive use may result in a temporary IP ban lasting 24 hours.

It's worth noting that most conventional VPN services may not provide a workaround to this restriction, as their IP ranges could potentially be pre-emptively banned. A less common VPN service or a self-hosted solution may be more successful in circumventing these limitations.

For the facilitation of development, a dev mode has been created. When activated, this mode ensures that the tool does not establish communication with Microsoft's servers. Instead, it operates using sample HTML files.

## Development

### Installation

```bash
git clone https://github.com/kyleaupton/win-iso.git
cd win-iso
yarn
```

### Running

```bash
# Interactive CLI
npx tsx src/cli/index.ts

# Non-interactive CLI
npx tsx src/cli/index.ts list
npx tsx src/cli/index.ts download win10x64
```

### Use Dev Mode

To use dev mode, set the `WIN_ISO_DEV` environment variable to `true`. This works for both the CLI and API. When activated, the tool will use sample HTML files instead of communicating with Microsoft's servers. This mode is unavailable in production as the sample HTML files are not included in the distribution.

```bash
WIN_ISO_DEV=true npx tsx src/cli/index.ts
```

## Todo

- [x] CLI Interface
- [x] Logging
- [x] Dev mode
- [ ] More version support
- [ ] Full API + CLI documentation
- [x] Download progress
- [x] Checksum verification
- [ ] Random user agent
- [ ] Tests
- [x] Support for other languages
