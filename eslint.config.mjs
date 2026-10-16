import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';

/**
 * Root ESLint config. Each project's eslint.config.mjs extends this one
 * (Angular apps add `nx.configs['flat/angular']` on top).
 *
 * Module boundaries: every project.json / package.json "nx.tags" must carry
 * one `scope:*` and one `type:*` tag. See docs/module-boundaries.md.
 */
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/coverage',
      '**/.nx',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          banTransitiveDependencies: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Which side of the system a project lives on.
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'],
            },
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'],
            },
            // What kind of project it is. Apps never import other apps.
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:contracts',
                'type:db',
                'type:domain',
                'type:ui',
                'type:data-access',
              ],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:contracts'],
            },
            {
              sourceTag: 'type:db',
              onlyDependOnLibsWithTags: ['type:contracts', 'type:domain'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:contracts'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:contracts', 'type:domain'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Must stay last: turns off stylistic rules that Prettier owns.
  prettier,
];
