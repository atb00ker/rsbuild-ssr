/**
 * This module implements a preview server for server-side rendering (SSR).
 * It serves the built static files and handles SSR requests by rendering
 * the app on the server before sending HTML to the client.
 */

import express from "express";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import addExpressUrls from "../helpers/locations";
import { ServerRenderProps } from "../helpers/types";

/**
 * Initializes and starts the preview server
 * - Sets up Express server
 * - Configures root path handler for SSR
 * - Serves static files from dist directory
 * - Starts listening on specified port
 */
export default async function main(): Promise<void> {
  const expressApp = express();

  // Add all locations to the express app
  await addExpressUrls(expressApp, serverRender);

  // Start the server
  expressApp.use(express.static("dist"));
  const port = process.env.PORT || 3000;
  expressApp.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}

/**
 * Handles server-side rendering requests
 * - Loads the server bundle
 * - Renders the app to HTML string
 * - Injects rendered content into HTML template
 * - Sends complete HTML response
 */
export function serverRender({ url, response }: ServerRenderProps): void {
  const require = createRequire(__filename);
  const remotesPath = path.join(process.cwd(), `./dist/server/index.js`);
  const app = require(remotesPath);
  const markup = app.render(url);
  const template = fs.readFileSync(`${process.cwd()}/dist/index.html`, "utf-8");
  const html = template.replace(`<!--app-content-->`, markup);
  response.status(200).set({ "Content-Type": "text/html" }).send(html);
}
