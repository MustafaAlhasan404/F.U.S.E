// Generate AES Key
// Client side
const forge = require("node-forge");

const generateAesKey = () => {
	// console.log("Generating AES key...");
	const aesSalt = forge.random.getBytesSync(16);
	const keyPassPhrase = forge.random.getBytesSync(16);
	const aesKey = forge.pkcs5.pbkdf2(
		keyPassPhrase,
		aesSalt,
		1000, // use according to your requirement
		32 // use according to your requirement
	);
	// console.log("AES key generated successfully", aesKey);
	// console.log("AES Key length:", aesKey.length);
	return aesKey;
};

// Encrypt AES Key using RSA public key
// React and React native
const encryptAesKey = (receivedpublicKeyPem, aesKey) => {
	try {
		// console.log("Encrypting AES key...");
		const publicKey = forge.pki.publicKeyFromPem(receivedpublicKeyPem);
		const encryptedAesKey = publicKey.encrypt(aesKey, "RSA-OAEP");
		return forge.util.encode64(encryptedAesKey);
		console.log("AES key encrypted successfully", encryptedAesKey);
	} catch (error) {
		console.error("Encryption error:", error);
		throw error;
	}
};

// Encrypt data using AES-GCM with the shared AES key
const encryptData = (data, aesKey) => {
	try {
		const iv = forge.random.getBytesSync(12); // Generate a random IV
		const cipher = forge.cipher.createCipher(
			"AES-GCM",
			forge.util.hexToBytes(aesKey)
		);
		cipher.start({ iv: iv });
		cipher.update(forge.util.createBuffer(JSON.stringify(data), "utf8"));
		cipher.finish();
		const encrypted = cipher.output.getBytes();
		const authTag = cipher.mode.tag.getBytes();
		// console.log("data encrypted successfully");
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

// Decrypt data using AES-GCM with the shared AES key
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
		decipher.start({ iv: iv, tag: authTag });
		decipher.update(forge.util.createBuffer(encrypted));
		const pass = decipher.finish();
		if (pass) {
			return JSON.parse(decipher.output.toString("utf8"));
		} else {
			throw new Error("Authentication failed during decryption");
		}
	} catch (error) {
		console.error("Decryption error:", error);
		throw error;
	}
};

module.exports = {
	generateAesKey,
	encryptAesKey,
	encryptData,
	decryptData,
};
