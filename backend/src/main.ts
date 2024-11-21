import { App } from './core/app';

async function startServer() {
  try {
    // Initialize application instance
    const app = new App();

    // Start server
    app.listen();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
