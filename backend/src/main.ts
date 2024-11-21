import { App } from './core/app';
import { logger } from './core/logger';

async function startServer() {
  try {
    // Initialize application instance
    const app = new App();

    // Start server
    app.listen();
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

startServer();
