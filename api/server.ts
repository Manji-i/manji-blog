import app from './app.js';
import { closeDb } from './database.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Signal PM2 that we're ready
  if (process.send) {
    process.send('ready');
  }
});

let shuttingDown = false;

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  if (shuttingDown) {
    console.log(`Already shutting down, ignoring ${signal}`);
    return;
  }
  
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);
  
  server.close(async (err) => {
    if (err) {
      console.error('Error closing server:', err);
    }
    
    try {
      await closeDb();
      console.log('Database connection closed');
    } catch (dbErr) {
      console.error('Error closing database:', dbErr);
    }
    
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 4 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('Could not shut down gracefully, forcing exit');
    process.exit(1);
  }, 4000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
