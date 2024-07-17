const { PrismaClient } = require('@prisma/client');
const logPrisma = new PrismaClient();

async function logServer(req, res) {
  const requestBody = { ...req.body };
  if (requestBody.jwt) {
    delete requestBody.jwt;
  }
  let userId;
  if (req.user) {
    if (typeof req.user.id !== 'undefined') {
      userId = req.user.id;
    }
  }

  const logData = {
    endpoint: req.originalUrl,
    body: JSON.stringify(requestBody),
    status: 1,
  };

  if (userId) {
    logData.userID = userId;
  }
  console.log(logData);

  try {
    await logPrisma.log.create({ data: logData });
    console.log('Log entry created successfully');
  } catch (error) {
    console.error('Error creating log entry:', error);
  }
}

async function logServerError(req, res, message) {
  const requestBody = { ...req.body };
  if (requestBody.jwt) {
    delete requestBody.jwt;
  }
  let userId;
  if (req.user) {
    if (typeof req.user.id !== 'undefined') {
      userId = req.user.id;
    }
  }

  const logData = {
    endpoint: req.originalUrl,
    body: JSON.stringify(requestBody),
    status: 0,
    message
  };

  if (userId) {
    logData.userID = userId;
  }
  console.log(logData);

  try {
    await logPrisma.log.create({ data: logData });
    console.log('Log entry created successfully');
  } catch (error) {
    console.error('Error creating log entry:', error);
  }
}

async function clearLog() {
  try {
    const allLogs = await logPrisma.log.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    const totalCount = allLogs.length;
    const countToKeep = 100;
    const countToDelete = totalCount - countToKeep;

    if (countToDelete > 0) {
      const logsToDelete = allLogs.slice(0, countToDelete);
      const deletedLogs = await logPrisma.log.deleteMany({
        where: {
          id: {
            in: logsToDelete.map((log) => log.id),
          },
        },
      });

      console.log(`Deleted ${deletedLogs.count} log entries, keeping the latest ${countToKeep} entries.`);
    } else {
      console.log('No log entries to delete. Keeping all entries.');
    }
  } catch (error) {
    console.error('Error deleting log entries:', error);
  }
}



module.exports = { logServer, logServerError, clearLog };