const crypto = require('crypto');
const { handleError } = require('../controllers/errorController');
const userService = require('../services/userService');
const forge = require('node-forge');
const {getAESKey, setAESKey, } = require('./keysDB/keysDB')

let keys = {};
let rsaPairs = {};

async function genPublicKey(req, res) {
  try {
    const { email } = req.body;
    const user = await userService.findByEmail(email);
    console.log(`user ${user.id} is trying to get Public key`);

    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }

    const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
    
    rsaPairs[user.id] = rsaKeyPair;
    
    console.log(`Public key for user ${user.id} is sent`);
    
    return res.status(200).json({ publicKey: publicKeyPem });
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function genKeysDashboard(req, res) {
  try {
    const { email, clientPublicKey } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }
    if (!["Admin", "Employee"].includes(user.role)) {
      let error = new Error("Unauthorized");
      error.meta = { code: "403", error: 'User not found' };
      throw error;
    }

    const server = crypto.createECDH('prime256v1');
    server.generateKeys();

    const serverPublicKeyBase64 = server.getPublicKey().toString('base64');
    const sharedKey = server.computeSecret(Buffer.from(clientPublicKey, 'base64'), null, 'hex');

    await setAESKey(user.id, sharedKey);

    console.log(`Shared Key for ${email} is sent`);

    return res.json({ serverPublicKey: serverPublicKeyBase64 });
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function decryption(req, res, next) {
  if (!req.body.payload) return next();
  try {
    if (typeof req.body.email === 'undefined' && typeof req.user === 'undefined') {
      return res.status(400).json({ error: "Can't find keys without email or JWT" });
    }
    const { email } = req.body;
    const user = email ? await userService.findByEmail(email) : null;
    const userId = user ? user.id : (req.user ? req.user.id : undefined);
    if (typeof userId === 'undefined') {
      return res.status(401).json({ error: 'Invalid or missing JWT token' });
    }
    const { payload } = req.body;
    const key = await getAESKey(userId);
    const decrypted = decrypt(payload, key);
    req.body = JSON.parse(decrypted);

    console.log('Message Decrypted');

    next();
  } catch (error) {
    console.error('Error decrypting message:', error);
    res.status(500).json({ error: "Failed to decrypt message" });
  }
}

async function encryption(data, userId, email) {
  if (typeof email !== 'undefined') {
    const user = await userService.findByEmail(email);
    if (!user) return null;
    userId = user.id;
  }

  try {
    data = JSON.stringify(data);
    const key = await getAESKey(userId);
    const encrypted = encrypt(data, key);
    // console.log('Encrypted message: ', encrypted);
    console.log('Message encrypted');
    return encrypted;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error("Failed to encrypt data");
  }
}

function encrypt(message, sharedKey) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), IV);

  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  const payload = IV.toString('hex') + encrypted + authTag;
  const payload64 = Buffer.from(payload, 'hex').toString('base64');

  return payload64;
}

function decrypt(payload, sharedKey) {
  const payloadHex = Buffer.from(payload, 'base64').toString('hex');

  const iv = payloadHex.slice(0, 32);
  const encrypted = payloadHex.slice(32, -32);
  const authTag = payloadHex.slice(-32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

async function makePayload(data, userId, email) {
  const dataS = JSON.stringify(data);
  console.log('Payload is in macking');
  // console.log('Data to encrypt: ', dataS);
  const payload = await encryption(dataS, userId, email);
  return { payload };
}

module.exports = {
  genPublicKey,
  encryption,
  decryption,
  makePayload,
  genKeysDashboard,
};


