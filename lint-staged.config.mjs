import { relative } from 'node:path';

/**
 * Runs on `git commit` (via .husky/pre-commit) against staged files only.
 * Lint goes through Nx so each file is checked with its own project's
 * ESLint config (Angular rules, module boundaries, etc.).
 *
 * lint-staged passes absolute paths; make them relative and quote them so a
 * checkout path with spaces doesn't split the --files argument.
 */
export default {
  '*': 'prettier --write --ignore-unknown',
  '*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}': (files) =>
    `nx affected -t lint --fix --files="${files
      .map((file) => relative(process.cwd(), file))
      .join(',')}"`,
};
