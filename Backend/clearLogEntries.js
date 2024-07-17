const { clearLog } = require('./controllers/logController');

async function clearLogEntries() {
  try {
    await clearLog();
    console.log('Log entries cleared successfully.');
  } catch (error) {
    console.error('Error clearing log entries:', error);
  }
}

clearLogEntries();
