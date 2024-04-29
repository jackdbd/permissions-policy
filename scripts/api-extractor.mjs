#!/usr/bin/env zx

/**
 * Usage
 *
 * From the repo root:
 * ./scripts/api-extractor.mjs
 */
import 'zx/globals'

const package_root = process.env.PWD
const config = path.join(package_root, 'api-extractor.json')

if (process.env.GITHUB_SHA) {
  // run this on the CI
  // https://api-extractor.com/pages/setup/invoking/
  await $`api-extractor run --config ${config} --verbose`
} else {
  await $`api-extractor run --config ${config} --local --verbose`
}

// this produces a LOT of output
// await $`api-extractor run --config ${config} --diagnostics`
