/**
 * Global Setup for Playwright Tests
 * Runs once before all tests to verify dependencies
 */

import { config } from "./config";

interface ServerCheck {
  name: string;
  url: string;
  description: string;
}

async function checkServer(check: ServerCheck): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(check.url, {
      signal: controller.signal,
      method: "GET",
    });

    clearTimeout(timeoutId);

    if (response) {
      console.log(`  ${check.name} is running at ${check.url}`);
      return true;
    }

    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("");
    if (errorMessage.includes("ECONNREFUSED")) {
      console.error(`  ${check.name} connection refused: ${check.url}`);
      console.error(`   ${check.description}`);
    } else {
      console.error(`  ${check.name} error: ${errorMessage}`);
      console.error(`   URL: ${check.url}`);
    }

    return false;
  }
}

export default async function globalSetup() {
  if (process.env['SKIP_DEPENDENCY_CHECK'] === "true") {
    console.log(
      "\n  Skipping server dependency check (SKIP_DEPENDENCY_CHECK=true)\n",
    );
    return;
  }

  const servers: ServerCheck[] = [
    {
      name: "Frontend",
      url: config.FRONTEND_BASE_URL,
      description: "Start frontend with: npm run dev",
    },
    {
      name: "Platform API",
      url: `${config.API_BASE_URL}/_internal_/healthcheck`,
      description: "Start platform with: cd ~/code/platform; ./run.sh; sbt 'project api; run'",
    },
  ];

  const results = await Promise.all(
    servers.map(async (server) => ({
      server,
      isRunning: await checkServer(server),
    })),
  );

  const failedServers = results.filter((r) => !r.isRunning);

  if (failedServers.length > 0) {
    console.error("\nThe following servers are not running:\n");

    failedServers.forEach(({ server }) => {
      console.error(`  ${server.name}: ${server.url}`);
      console.error(`    ${server.description}\n`);
    });

    process.exit(1);
  }
}
