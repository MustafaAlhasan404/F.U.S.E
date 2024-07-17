const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('keys.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
    // Create a table to store the keys if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS keys (
      userId TEXT PRIMARY KEY,
      aesKey TEXT,
      rsaKeyPair TEXT,
      expiresAt INTEGER
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  }
});

async function getAESKey(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT aesKey, expiresAt FROM keys WHERE userId = ?', [userId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row && row.expiresAt > Math.floor(Date.now() / 1000)) {
        resolve(row.aesKey);
      } else {
        resolve(null);
      }
    });
  });
}

async function setAESKey(userId, aesKey) {
  const expiresAt = Math.floor(Date.now() / 1000) + (30 * 60); // 30 minutes from now
  return new Promise((resolve, reject) => {
    db.run('INSERT OR REPLACE INTO keys (userId, aesKey, expiresAt) VALUES (?, ?, ?)', [userId, aesKey, expiresAt], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function getRSAKeyPair(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT rsaKeyPair, expiresAt FROM keys WHERE userId = ?', [userId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row && row.expiresAt > Math.floor(Date.now() / 1000)) {
        resolve(row.rsaKeyPair);
      } else {
        resolve(null);
      }
    });
  });
}

async function setRSAKeyPair(userId, rsaKeyPair) {
  const expiresAt = Math.floor(Date.now() / 1000) + (30 * 60); // 30 minutes from now
  return new Promise((resolve, reject) => {
    db.run('INSERT OR REPLACE INTO keys (userId, rsaKeyPair, expiresAt) VALUES (?, ?, ?)', [userId, rsaKeyPair, expiresAt], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  getAESKey,
  setAESKey,
  getRSAKeyPair,
  setRSAKeyPair,
};
