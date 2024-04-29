import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import defDebug from 'debug'
import {
  markdownTableFromZodSchema,
  stringsFromZodAnyType
} from '@jackdbd/zod-to-doc'
import {
  image,
  licenseLink,
  link,
  list,
  toc,
  compactEmptyLines,
  transcludeFile
} from '@thi.ng/transclude'
import { DEBUG_PREFIX } from '../src/constants.js'
import { feature, options } from '../lib/index.js'

const debug = defDebug(`script:readme`)

const permissionsPolicyFeaturesMarkdown = () => {
  const arr = stringsFromZodAnyType(feature)

  const links = arr.map((s) => {
    const feature = (s as any).replaceAll('`', '').replaceAll('"', '')
    return link(
      feature,
      `https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy/${feature}`
    )
  })

  const lines: string[] = []
  lines.push('\n\n')
  lines.push(`### Features`)
  lines.push('\n\n')
  lines.push(
    `This library defines ${arr.length} \`Permissions-Policy\` features:`
  )
  lines.push('\n\n')
  lines.push(links.join(', '))
  return lines.join('')
}

const permissionsPolicyAllowlistMarkdown = () => {
  // const arr = stringsFromZodAnyType(allow_item)

  const lines: string[] = []
  lines.push('\n\n')
  lines.push(`### Allowlist`)
  lines.push('\n\n')
  lines.push(
    `An ${link(
      'allowlist',
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy#allowlists'
    )} is a list containing specific origins or special values.`
  )

  return lines.join('')
}

export interface CalloutConfig {
  // https://github.com/ikatyang/emoji-cheat-sheet
  emoji: string
  title: string
  message: string
}

export const callout = (cfg: CalloutConfig) => {
  const paragraphs = cfg.message.split('\n\n')
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')

  const lines = [`> ${cfg.emoji} **${cfg.title}**`, '\n', `>`, '\n', body]
  return lines.join('')
}

interface Config {
  current_year: number
  project_started_in_year: number
  repo_name: string
}

const main = async ({
  current_year,
  project_started_in_year,
  repo_name
}: Config) => {
  const pkg_root = resolve('.')
  const pkg = JSON.parse(readFileSync(join(pkg_root, 'package.json'), 'utf-8'))
  debug(`generating README.md for ${pkg.name}`)
  const [npm_scope, unscoped_pkg_name] = pkg.name.split('/')
  const github_username = npm_scope.replace('@', '') as string

  const errors: Error[] = []
  const warnings: string[] = []
  const configurations: string[] = [`## Configuration`, '\n\n']

  configurations.push(
    `Read these resources to understand how to configure the \`Permissions-Policy\` and the \`Feature-Policy\` HTTP response headers.`
  )

  const links = [
    link(
      'A new security header: Feature Policy',
      'https://scotthelme.co.uk/a-new-security-header-feature-policy/'
    ),
    link(
      'Goodbye Feature Policy and hello Permissions Policy!',
      'https://scotthelme.co.uk/goodbye-feature-policy-and-hello-permissions-policy/'
    ),
    link(
      'Permissions Policy Explainer',
      'https://github.com/w3c/webappsec-permissions-policy/blob/main/permissions-policy-explainer.md'
    ),
    link(
      'Policy Controlled Features',
      'https://github.com/w3c/webappsec-permissions-policy/blob/main/features.md'
    ),
    link(
      'Controlling browser features with Permissions Policy',
      'https://developer.chrome.com/en/docs/privacy-sandbox/permissions-policy/'
    )
  ]

  configurations.push('\n\n')
  configurations.push(list(links))

  const res_a = markdownTableFromZodSchema(options)
  if (res_a.error) {
    errors.push(res_a.error)
  } else {
    configurations.push('\n\n')
    configurations.push(`### Options`)
    configurations.push('\n\n')
    configurations.push(res_a.value)
  }

  configurations.push(permissionsPolicyFeaturesMarkdown())
  configurations.push(permissionsPolicyAllowlistMarkdown())

  const transcluded = transcludeFile(join(pkg_root, 'tpl.readme.md'), {
    user: pkg.author,
    templates: {
      badges: () => {
        const npm_package = link(
          image(
            `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}.svg`,
            'npm package badge'
          ),
          `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}`
          // `https://www.npmjs.com/package/${npm_scope}/${unscoped_pkg_name}`
        )

        const install_size = link(
          image(
            `https://packagephobia.com/badge?p=${npm_scope}/${unscoped_pkg_name}`,
            'install size badge'
          ),
          `https://packagephobia.com/result?p=${npm_scope}/${unscoped_pkg_name}`
        )

        const codefactor = link(
          image(
            `https://www.codefactor.io/repository/github/${github_username}/${unscoped_pkg_name}/badge`,
            'CodeFactor badge'
          ),
          `https://www.codefactor.io/repository/github/${github_username}/${unscoped_pkg_name}`
        )

        const socket = link(
          image(
            `https://socket.dev/api/badge/npm/package/${npm_scope}/${unscoped_pkg_name}`,
            'Socket badge'
          ),
          `https://socket.dev/npm/package/${npm_scope}/${unscoped_pkg_name}`
        )

        const ci_workflow = link(
          image(
            `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/ci.yaml/badge.svg`,
            'CI GitHub workflow badge'
          ),
          `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/ci.yaml`
        )

        const codecov = link(
          image(
            `https://codecov.io/gh/${github_username}/${unscoped_pkg_name}/graph/badge.svg?token=9jddzo5Dt3`,
            'CodeCov badge'
          ),
          `https://codecov.io/gh/${github_username}/${unscoped_pkg_name}`
        )

        const conventional_commits = link(
          image(
            `https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white`,
            'Conventional Commits badge'
          ),
          'https://conventionalcommits.org'
        )

        return [
          npm_package,
          install_size,
          ci_workflow,
          codecov,
          codefactor,
          socket,
          conventional_commits
        ].join('\n')
      },

      configuration: configurations.join(''),

      'engines.node': () => {
        const lines = [
          `This project is tested on Node.js ${pkg.engines.node}.`,
          '\n\n',
          `You can use a Node.js version manager like ${link(
            'nvm',
            'https://github.com/nvm-sh/nvm'
          )}, ${link('asdf', 'https://github.com/asdf-vm/asdf')} or ${link(
            'volta',
            'https://github.com/volta-cli/volta'
          )} to manage your Node.js versions.`
        ]
        return lines.join('')
      },

      'pkg.deps': () => {
        const entries = Object.entries(pkg.dependencies)

        const rows = entries.map(
          ([name, version]) =>
            `| ${link(name, `https://www.npmjs.com/package/${name}`)} | \`${version}\` |`
        )
        const table = [
          `| Package | Version |`,
          '|---|---|',
          rows.join('\n')
        ].join('\n')

        return [`## Dependencies`, '\n\n', table].join('')
      },

      'pkg.description': pkg.description,

      'pkg.docs': () => {
        const lines = [
          `## Docs`,
          '\n\n',
          `[Docs generated by TypeDoc](https://${github_username}.github.io/${repo_name}/${unscoped_pkg_name}/)`,
          '\n\n',
          callout({
            emoji: ':open_book:', // open_book, page_facing_up, page_with_curl
            title: 'API Docs',
            message: `This project uses [API Extractor](https://api-extractor.com/) and [api-documenter markdown](https://api-extractor.com/pages/commands/api-documenter_markdown/) to generate a bunch of markdown files and a \`.d.ts\` rollup file containing all type definitions consolidated into a single file. I don't find this \`.d.ts\` rollup file particularly useful. On the other hand, the markdown files that api-documenter generates are quite handy when reviewing the public API of this project.\n\n*See [Generating API docs](https://api-extractor.com/pages/setup/generating_docs/) if you want to know more*.`
          })
        ]
        return lines.join('')
      },

      'pkg.installation': () => {
        const lines = [`## Installation`]

        lines.push('\n\n')
        lines.push(`\`\`\`sh`)
        lines.push('\n')
        lines.push(`npm install ${pkg.name}`)
        lines.push('\n')
        lines.push(`\`\`\``)

        if (pkg.engines && pkg.engines.node) {
          lines.push('\n\n')
          lines.push(
            `**Note**: this library was tested on Node.js ${pkg.engines.node}. It might work on other Node.js versions though.`
          )
        }

        return lines.join('')
      },

      'pkg.license': ({ user }) => {
        const copyright =
          current_year > project_started_in_year
            ? `&copy; ${project_started_in_year} - ${current_year}`
            : `&copy; ${current_year}`

        const lines = [
          `## License`,
          '\n\n',
          `${copyright} ${link(
            user.name,
            'https://www.giacomodebidda.com/'
          )} // ${licenseLink(pkg.license)}`
        ]
        return lines.join('')
      },

      'pkg.name': pkg.name,

      'pkg.peerDependencies': () => {
        if (pkg.peerDependencies) {
          const entries = Object.entries(pkg.peerDependencies)
          const what =
            entries.length === 1 ? `peer dependency` : `peer dependencies`

          const rows = entries.map(([name, version]) => {
            const s = (version as any).replaceAll('||', 'or')
            return `| \`${name}\` | \`${s}\` |`
          })

          const table = [
            `| Peer | Version range |`,
            '|---|---|',
            rows.join('\n')
          ].join('\n')

          const strings = [
            callout({
              // emoji: ':warning:',
              emoji: '⚠️',
              title: `Peer Dependencies`,
              message: `This package defines ${entries.length} ${what}.`
            }),
            '\n\n',
            table
          ]
          return strings.join('')
        } else {
          return ''
        }
      },

      troubleshooting: () => {
        const lines = [
          `## Troubleshooting`,
          '\n',
          `This project uses the [debug](https://github.com/debug-js/debug) library for logging.`,
          `You can control what's logged using the \`DEBUG\` environment variable.`,
          '\n',
          `For example, if you set your environment variables in a \`.envrc\` file, you can do:`,
          '\n',
          `\`\`\`sh`,
          `# print all logging statements`,
          `export DEBUG=${DEBUG_PREFIX}:*`,
          `\`\`\``
        ]
        return lines.join('\n')
      }
    },
    post: [toc(), compactEmptyLines]
  })

  const out_filepath = join(pkg_root, 'README.md')
  debug(`write ${out_filepath}`)
  writeFileSync(out_filepath, transcluded.src)
}

await main({
  current_year: new Date().getFullYear(),
  project_started_in_year: 2024,
  repo_name: 'permissions-policy'
})
