const crypto = require('crypto');
const { handleError } = require('../controllers/errorController');
const userService = require('../services/userService');
const forge = require('node-forge');
const {getAESKey, setAESKey, } = require('./keysDB/keysDB')

//let keys = {};
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

async function getAESkey(req, res) {
  try {
    const { email, encryptedAesKey } = req.body;
    const user = await userService.findByEmail(email);
    console.log(`user ${user.id} is trying to get AES key`);

    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }

    const decryptedAesKey = rsaPairs[user.id].privateKey.decrypt(forge.util.decode64(encryptedAesKey), 'RSA-OAEP');

    //console.log(`AES key for user ${user.id} is ${decryptedAesKey.toString('hex')}, ${decryptedAesKey.toString('base64')}`);

    //keys[user.id] = decryptedAesKey.toString('hex');
    await setAESKey(user.id, decryptedAesKey.toString('hex'));

    rsaPairs[user.id] = null;

    return res.status(200).json({ done: "success" });
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function decryptionMobile(req, res, next) {
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
    const decrypted = decryptData(payload, key);
    req.body = JSON.parse(decrypted);

    console.log('Message Decrypted');

    next();
  } catch (error) {
    console.error('Error decrypting message:', error);
    res.status(500).json({ error: "Failed to decrypt message" });
  }
}

const decryptData = (encryptedData, aesKey) => {
  try {
    const decodedData = forge.util.decode64(encryptedData);
    const iv = decodedData.slice(0, 12);
    const encrypted = decodedData.slice(12, decodedData.length - 16);
    const authTag = decodedData.slice(decodedData.length - 16);

    const decipher = forge.cipher.createDecipher(
      "AES-GCM",
      forge.util.hexToBytes(aesKey)
    );
    decipher.start({
      iv: iv,
      tagLength: 128,
      tag: authTag,
    });
    decipher.update(forge.util.createBuffer(encrypted));
    const pass = decipher.finish();

    if (pass) {
      console.log("data decrypted successfully");
      return decipher.output.toString("utf8");
    } else {
      throw new Error("Authentication failed during decryption");
    }
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};

async function makePayloadMobile(data, userId, email) {
  try {
    const user = userId? await userService.findById(userId) : await userService.findByEmail(email);
    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }

    const aesKey = await getAESKey(user.id);
    if (!aesKey) {
      let error = new Error("Key not found");
      error.meta = { code: "404", error: 'AES key not found for the user' };
      throw error;
    }

    const payload = encryptMobile(data, aesKey);
    return { payload };
  } catch (error) {
    console.error('Error creating payload:', error);
    throw error;
  }
}

const encryptMobile = (data, aesKey) => {
  try {
    const iv = forge.random.getBytesSync(12); 
    const cipher = forge.cipher.createCipher(
      "AES-GCM",
      forge.util.hexToBytes(aesKey)
    );
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(data), "utf8"));
    cipher.finish();
    const encrypted = cipher.output.getBytes();
    const authTag = cipher.mode.tag.getBytes();
    console.log("data encrypted successfully");
    return forge.util.encode64(
      forge.util
        .createBuffer(iv)
        .putBytes(encrypted)
        .putBytes(authTag)
        .getBytes()
    );
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
};


module.exports = {
  genPublicKey,
  getAESkey,
  decryptionMobile,
  encryptMobile,
  makePayloadMobile,

};


