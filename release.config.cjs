/**
 * Configuration for the semantic-release bot.
 */
const {
  changelog,
  commit_analyzer,
  exec,
  git,
  github,
  npm,
  release_notes_generator,
  telegram,
} = require("./config/semantic-release-plugins.cjs");

const config = {
  // https://semantic-release.gitbook.io/semantic-release/usage/configuration#branches
  branches: ["main", { name: "canary", prerelease: true }],

  ci: true,

  // IMPORTANT! The order of plugin matters:
  // - The git plugin must be called AFTER the npm plugin
  // https://github.com/semantic-release/git#examples
  // https://semantic-release.gitbook.io/semantic-release/support/faq#why-is-the-package.jsons-version-not-updated-in-my-repository
  plugins: [
    commit_analyzer,
    release_notes_generator,
    telegram,
    exec,
    changelog,
    npm,
    github,
    git,
  ],
};

// console.log('=== semantic-release ===', config)

module.exports = config;
