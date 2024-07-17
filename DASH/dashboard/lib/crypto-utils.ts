import * as crypto from 'crypto';

let client: crypto.ECDH;
// let sharedKey: string;

export const genPublic = async (): Promise<string> => {
  client = crypto.createECDH('prime256v1');
  client.generateKeys();

  const clientPublicKeyBase64 = client.getPublicKey().toString('base64');

  return clientPublicKeyBase64;
};

export const genShared = async (serverPublicKey: string): Promise<string> => {
  let sharedKey = client.computeSecret(Buffer.from(serverPublicKey, 'base64')).toString('hex');
  // console.log("Generated shared key:", sharedKey); // Debug: Print the shared key
  return sharedKey;
};

export const decryption = async (res: { payload: string }, sharedKey: string): Promise<any> => {
  if (!res) {
    // console.log('no data');
    return;
  }
  const decrypted = decrypt(res.payload, sharedKey);
  const data = JSON.parse(decrypted);
  // console.log('Decrypted message: ', decrypted);
  return data;
};

export const encryption = async ({ data }: { data: any }, sharedKey: string): Promise<string> => {
  const stringData = JSON.stringify(data);
  const encrypted = encrypt(stringData, sharedKey);
  return encrypted;
};

const encrypt = (message: string, sharedKey: string): string => {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), IV);

  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const auth_tag = cipher.getAuthTag().toString('hex');

  const payload = IV.toString('hex') + encrypted + auth_tag;
  const payload64 = Buffer.from(payload, 'hex').toString('base64');

  return payload64;
};

const decrypt = (payload: string, sharedKey: string): string => {
  const payloadHex = Buffer.from(payload, 'base64').toString('hex');

  const iv = payloadHex.slice(0, 32);
  const encrypted = payloadHex.slice(32, payloadHex.length - 32);
  const auth_tag = payloadHex.slice(payloadHex.length - 32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(auth_tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
