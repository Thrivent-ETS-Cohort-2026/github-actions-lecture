# Jest Testing Setup

Follow these steps to add Jest and React Testing Library to this Vite, React, and TypeScript project.

## 1. Install the testing dependencies

Open a terminal in the run:

```bash
npm install --save-dev jest jest-environment-jsdom @types/jest babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @testing-library/react @testing-library/dom @testing-library/jest-dom
```

Use these packages to run Jest, render React components, provide a browser-like test environment, transform TypeScript and JSX, and add DOM-specific assertions.

## 2. Configure Babel

Add `babel.config.cjs` to the root of `my-app`:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
}
```

Use Babel to transform modern JavaScript, React JSX, and TypeScript before Jest runs each test.

Do not add the `allExtensions` or `isTSX` options. Babel 8 no longer supports those options.

## 3. Configure Jest

Add `jest.config.cjs` to the root of `my-app`:

```js
module.exports = {
  clearMocks: true,
  restoreMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
}
```

Use `jsdom` to provide browser APIs such as `document` and `window` to component tests.

Clear mock usage data and restore spies between tests to prevent one test from affecting another.

## 5. Add the Jest types to TypeScript

In `tsconfig.app.json`, find:

```json
"types": ["vite/client"],
```

Remove it and add:

```json
"types": ["vite/client", "jest", "@testing-library/jest-dom"],
```

Allow TypeScript to recognize Jest globals and React Testing Library matchers.

## 6. Add the test scripts

In the `scripts` section of `package.json`, add:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

## 7. Add the `Counter` component test

Add `src/Counter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import Counter from './Counter'
import { ThemeContext } from './ThemeContext'
import '@testing-library/jest-dom'

function renderCounter(changeText = jest.fn()) {
  const toggleTheme = jest.fn()

  render(
    <ThemeContext.Provider
      value={{
        theme: 'light',
        toggleTheme,
      }}
    >
      <Counter
        initialCount={1}
        pageTitle="Counter"
        changeText={changeText}
      />
    </ThemeContext.Provider>,
  )

  return {
    changeText,
    toggleTheme,
  }
}

describe('Counter', () => {
  test('renders the title and initial count', () => {
    renderCounter()

    expect(
      screen.getByRole('heading', { name: 'Counter' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
    expect(screen.getByText('Reducer count: 1')).toBeInTheDocument()
  })
})
```

Render `Counter` inside `ThemeContext.Provider` because the component requires the theme context.

Verify that the component displays its heading, initial state count, and initial reducer count.

## 8. Add the service test

Add `src/service.test.ts`:

```ts
import { addUser } from './service'

beforeEach(() => {
  globalThis.fetch = jest.fn()
})

describe('addUser', () => {
  test('posts the user to the users endpoint', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        ok: true,
      } as Response)

    await addUser({ name: 'Taylor' })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Taylor',
        }),
      },
    )
  })
})
```

Create a mock `fetch` function before each test because JSDOM does not provide `fetch`.

Mock a successful response and verify that `addUser` sends one request to the correct endpoint with the expected method, headers, and body.

Do not start `json-server` for this unit test. Use the mocked `fetch` function instead.

## 9. Run the tests

Run all tests once:

```bash
npm test
```

Keep Jest running while changing the source files or tests:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run test:coverage
```

Run the TypeScript build separately because Babel transforms TypeScript without type-checking it:

```bash
npm run build
```

Expect the initial test run to report:

```text
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
```