#!/usr/bin/env sh
# npx electron-packager . my-app --electron-version "$(electron -v)"  --platform=darwin --arch=arm64 --out=dist --overwrite  --ignore='^(?!main|node_modules|package.json|package-lock.json).*$'
# npx electron-packager . my-app --electron-version "$(electron -v)"  --platform=darwin --arch=arm64 --out=dist --overwrite  --ignore='(?!package.json)(package.json|.git|.gitignore|deno.lock|dist|flake.ignore.nix|flake.lock|flake.nix|macos_jail.ignore|node_modules.ignore|run|test.ignore.zip|test.zip|tooling)'
rm -rf dist
# echo "Note: only stuff in ./main/ will be included"
npx electron-packager . ExampleApp --electron-version "$(electron --no-sandbox -v)"  --platform=darwin --arch=arm64 --out=dist --overwrite  --ignore='^(?!main|node_modules|package.json|package.json|package-lock.json|.*/main|.*/node_modules|.*/package.json|.*/package.json|.*/package-lock.json)(.+)$'

# to get a windows iso
# deno run -A ./subrepos/src/cli/index.ts --downloadTargetPath '/Users/jeffhykin/repos/nixpkg_electron_template/dist/'
# open ./dist/my-app-darwin-arm64/my-app.app