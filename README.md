# Rsbuild-SSR

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/rsbuild-ssr.svg)](https://www.npmjs.com/package/rsbuild-ssr)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Rsbuild-SSR is a Typescript library that extends the capabilities of [Rsbuild](https://github.com/atb00ker/rsbuild) to support server-side rendering (SSR) for React applications using Express.

## Installation

To install Rsbuild-SSR, use your preferred package manager:

```bash
npm install rsbuild-ssr
# or
yarn add rsbuild-ssr
# or
pnpm add rsbuild-ssr
```

## Usage

You can see an example of how to use Rsbuild-SSR in the [NetworthDOM](https://github.com/financial-footprints/NetworthDOM) project.

### Step 1: Configure `rsbuild.config.mjs`:

We want to expose a variable named `ssrUrls` and use `rsbuild` environments, here is an example:

```javascript
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  environments: {
    web: {
      output: { target: "web" },
      source: { entry: { index: "./src/index.client" } },
    },
    ssr: {
      output: { target: "node", distPath: { root: "dist/server" } },
      source: { entry: { index: "./src/index.server" } },
    },
  },
  html: { template: "./react-root.html" },
});

export const ssrUrls = ["/", "/about", "contacts"];
```

### Step 2: Create the template file

Create a file named `react-root.html` in the root of your project, example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>React Root</title>
  </head>
  <body>
    <div id="root"><!--app-content--></div>
  </body>
</html>
```

You may change any part of the template as per your requirements, but `<div id="root"><!--app-content--></div>` is required.

### Step 3: Create the server entry file

Create a file named `index.server.tsx` in the `src` directory, example:

```tsx
import React from "react";
import ReactDOMServer from "react-dom/server";
import { HomePage } from "./routes/home/page";

// Use "path" when there are multiple routes
// Example: if path is '/', it should render HomePage
export function render(path: string) {
  return ReactDOMServer.renderToString(<HomePage />);
}
```

### Step 4: Create the client entry file

Create a file named `index.client.tsx` in the `src` directory, example:

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { AppRouter } from "./router";

ReactDOM.hydrate(<AppRouter />, document.getElementById("root"));
```

### Step 5: Update your `package.json`

Add the following scripts to your `package.json`:

```json
"scripts": {
  "dev": "rsbuild-ssr dev",
  "build": "rsbuild build",
  "preview": "rsbuild-ssr preview"
}
```

And you are ready to go!

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Acknowledgments

- [Rsbuild](https://github.com/atb00ker/rsbuild) for providing the core build system.
- [Express](https://expressjs.com/) for the web server framework.
