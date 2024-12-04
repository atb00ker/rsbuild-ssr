#!/usr/bin/env node

import preview from "./server/preview";
import develop from "./server/develop";

const [, , command] = process.argv;

async function main() {
  switch (command) {
    case "preview":
      await preview();
      break;
    case "dev":
      console.log("Starting development server...");
      await develop();
      break;
    default:
      console.error('Please provide a valid command: "preview" or "dev"');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
