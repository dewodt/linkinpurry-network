import { App } from './core/app.js';
import { logger } from './core/logger';

async function startServer() {
  try {
    // Initialize application instance
    const app = new App();

    // Start server
    app.listen();
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);

    const maxTries = 3;
    const waitTime = 1000;
    let tries = 0;
    while (tries < maxTries) {
      tries++;
      logger.error(`Server failed to start, retrying in ${waitTime} ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    process.exit(1);
  }
}

startServer();
