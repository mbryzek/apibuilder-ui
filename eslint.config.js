import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import { typed as p10Typed, svelte as p10Svelte, tests as p10Tests, testFiles as p10TestFiles } from './eslint.p10.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores
  {
    ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**', 'src/generated/**', '*.config.js', '*.config.ts']
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript files (server-side, utils, etc.)
  {
    files: ['**/*.ts'],
    // `playwright/` is type-checked by tsconfig.playwright.json, not tsconfig.json — linting it
    // under this block's `project` would fail with "file not included in project".
    ignores: ['**/*.svelte.ts', 'playwright/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        App: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...p10Typed,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',

      // KEY RULE: Catch shorthand properties in conditional spreads
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SpreadElement > LogicalExpression[operator="&&"] > ObjectExpression > Property[shorthand=true]',
          message:
            'Avoid shorthand properties in conditional spreads. Use explicit { field_name: value } to prevent property name mismatches with API types.'
        },
        {
          selector: 'SpreadElement > ConditionalExpression > ObjectExpression > Property[shorthand=true]',
          message:
            'Avoid shorthand properties in conditional spreads. Use explicit { field_name: value } to prevent property name mismatches with API types.'
        }
      ]
    }
  },

  // Playwright e2e specs and helpers — same rules as src, its own tsconfig
  {
    files: ['playwright/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.playwright.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...p10Typed,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error'
    }
  },

  // Svelte TypeScript files (.svelte.ts) - Svelte runes
  {
    files: ['**/*.svelte.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        $state: 'readonly',
        $derived: 'readonly',
        $effect: 'readonly',
        $props: 'readonly',
        $bindable: 'readonly',
        $inspect: 'readonly',
        $host: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...p10Typed,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      'no-restricted-syntax': [
        'error',
        {
          selector: 'SpreadElement > LogicalExpression[operator="&&"] > ObjectExpression > Property[shorthand=true]',
          message:
            'Avoid shorthand properties in conditional spreads. Use explicit { field_name: value } to prevent property name mismatches with API types.'
        },
        {
          selector: 'SpreadElement > ConditionalExpression > ObjectExpression > Property[shorthand=true]',
          message:
            'Avoid shorthand properties in conditional spreads. Use explicit { field_name: value } to prevent property name mismatches with API types.'
        }
      ]
    }
  },

  // Svelte files. Type-aware: `.svelte` is in the tsconfig SvelteKit generates, so the
  // parser can hand typescript-eslint a program for a component and `no-floating-promises`
  // reads real types here rather than guessing.
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte']
      },
      globals: {
        ...globals.browser,
        $state: 'readonly',
        $derived: 'readonly',
        $effect: 'readonly',
        $props: 'readonly',
        $bindable: 'readonly',
        $inspect: 'readonly',
        $host: 'readonly'
      }
    },
    plugins: {
      svelte: sveltePlugin,
      '@typescript-eslint': tseslint
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      // KEY RULE: {@html} is the only XSS sink in a Svelte app, and the values that reach our
      // components (names, scraped data, model output) are user-set. Every use must be an
      // explicit, justified exemption naming why the string is app-authored - never a default.
      'svelte/no-at-html-tags': 'error',
      ...p10Svelte,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // KEY RULE: Catch shorthand properties in conditional spreads
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SpreadElement > LogicalExpression[operator="&&"] > ObjectExpression > Property[shorthand=true]',
          message:
            'Avoid shorthand properties in conditional spreads. Use explicit { field_name: value } to prevent property name mismatches with API types.'
        },
        {
          selector: 'SpreadElement > ConditionalExpression > ObjectExpression > Property[shorthand=true]',
          message:
            'Avoid shorthand properties in conditional spreads. Use explicit { field_name: value } to prevent property name mismatches with API types.'
        }
      ]
    }
  },

  // The only files allowed to use {@html}: the documentation pages, whose every injection is a
  // static template literal of hand-written code samples with no interpolation and no request
  // data in it. Anything rendering a value - an organization name, an application key, a
  // service description - must be rendered as data, so adding a file here is a decision to be
  // argued for in review rather than a default.
  {
    files: ['src/routes/doc/**/+page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off'
    }
  },

  // Test files relax exactly one P10 rule; `eslint.p10.js` says which and why. Last of the
  // rule blocks, so it wins over the per-extension blocks above for the files it names.
  {
    files: p10TestFiles,
    rules: p10Tests
  },

  // JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },

  // Disable stylistic rules that conflict with prettier
  prettierConfig
];
