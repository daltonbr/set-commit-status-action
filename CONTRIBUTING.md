# Contributing

Thanks for taking the time to contribute.

## Please do not commit `dist/`

This repository ships a bundled `dist/index.js`, because that is the file the
Actions runner executes. It is committed to the default branch, but it is
generated, and only the maintainer generates it.

When you open a pull request, please change `src/` only and leave `dist/` out.
CI will fail your pull request if it modifies `dist/`. Once your change is
merged, a workflow rebuilds `dist/` and commits it, so there is nothing you
need to do.

Why, briefly: the bundle is a single minified line of roughly 1 MB, so a change
to it cannot be reviewed. Building it from source that has been reviewed is what
makes the review mean anything. It also conflicts unresolvably between any two
open pull requests.

## Please do not bump the version

The `version` field in `package.json` is set by the release workflow, which runs
`npm version <version>` when a release is cut. If a pull request has already set
that value, `npm version` fails with "Version not changed" and the release
aborts.

There is also no version you could correctly pick: which release your change
lands in depends on what else merges first, and on whether that release ends up
being a patch, a minor, or a major.

## Working locally

Node 24, as declared in `engines` in `package.json`.

```sh
npm ci
npm run build     # tsc
npm run lint      # eslint
npm run package   # ncc, writes dist/
npm run all       # all of the above
```

Running `npm run all` is a good way to confirm your change compiles and lints.
It will modify `dist/` as a side effect. That is fine, just leave those changes
out of your commits.
