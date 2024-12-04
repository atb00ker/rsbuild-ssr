/**
 * This module implements a development server for server-side rendering (SSR).
 * It serves the development server and handles SSR requests by rendering
 * the app on the server before sending HTML to the client.
 */

import express from "express";
import { createRsbuild, loadConfig } from "@rsbuild/core";
import { Renderer, ServerRenderProps } from "../helpers/types";
import addExpressUrls from "../helpers/locations";
import { RsbuildDevServer } from "@rsbuild/core/dist-types/server/devServer";

/**
 * Sets up and starts the development server with SSR support
 * @returns Object containing close function to shutdown the server
 */
export default async function main() {
  const { rsbuildServer, renderServer } = await getRsDevServer();
  const expressApp = express();

  // Add all locations to the express app
  await addExpressUrls(expressApp, renderServer, (response) => {
    response.sendStatus(500);
  });

  // Start servers
  expressApp.use(rsbuildServer.middlewares);
  const httpServer = expressApp.listen(rsbuildServer.port, () => {
    rsbuildServer.afterListen();
  });
  rsbuildServer.connectWebSocket({ server: httpServer });

  return {
    close: async () => {
      await rsbuildServer.close();
      httpServer.close();
    },
  };
}

/**
 * Creates and configures the Rsbuild development server
 * @returns Object containing the server instance and SSR render function
 */
async function getRsDevServer() {
  const { content } = await loadConfig({});
  const rsbuild = await createRsbuild({
    rsbuildConfig: content,
  });
  const rsbuildServer = await rsbuild.createDevServer();
  return {
    rsbuildServer,
    renderServer: getRenderServer(rsbuildServer),
  };
}

/**
 * Server-side rendering function that processes requests
 * @param serverAPI - The Rsbuild development server instance
 * @returns Async function that handles SSR for incoming requests
 */
function getRenderServer(serverAPI: RsbuildDevServer) {
  return async function ({ url, response }: ServerRenderProps) {
    // Load and render the SSR bundle
    const indexModule = (await serverAPI.environments.ssr.loadBundle(
      "index"
    )) as Renderer;
    const markup = indexModule.render(url);

    // Get the HTML template and inject rendered content
    const template = await serverAPI.environments.web.getTransformedHtml(
      "index"
    );
    const html = template.replace("<!--app-content-->", markup);

    // Send the complete HTML response
    response.writeHead(200, {
      "Content-Type": "text/html",
    });
    response.end(html);
  };
}
