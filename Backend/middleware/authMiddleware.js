const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const secretKey = process.env.JWT_SECRET;
const revokedTokens = new Set();

// Function to remove expired tokens from the revokedTokens set
function removeExpiredTokens() {
  const now = Date.now();
  revokedTokens.forEach(token => {
    const decoded = jwt.decode(token);
    if (decoded.exp * 1000 < now) {
      revokedTokens.delete(token);
    }
  });
}

const authenticateJWT = (req, res, next) => {
  const token = req.body.jwt || req.headers['x-access-token'] || req.query.jwt;

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  removeExpiredTokens();

  if (revokedTokens.has(token)) {
    return res.status(401).json({ message: 'Token has been revoked' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateJWT, revokedTokens };