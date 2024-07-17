const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authService = require('../services/authService');
const userService = require('../services/userService');
const merchantService = require('../services/merchantService');
const customerService = require('../services/customerService');
const accountService = require('../services/accountService');
const { handleError } = require('./errorController');
const { revokedTokens } = require('../middleware/authMiddleware');
const { makePayload } = require('../middleware/encryptionMiddleware');
const validate = require('./validateController');
const { makePayloadRegMobile } = require('../middleware/regMobileEncryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

const secretKey = process.env.JWT_SECRET;
const maxAge = 30 * 60 * 1000;

async function register(req, res) {
  try {
    const salt = await bcrypt.genSalt();
    const { name, role, email, phone, birth, password } = req.body;
    const { category, workPermit } = req.body;
    const { monthlyIncome } = req.body;

    const newUser = await userService.create(name, role, email, phone, birth, await bcrypt.hash(password, salt));
    const account = await accountService.create(newUser.id, 0, "Checking");

    try {
      if (role === "Merchant") {
        await merchantService.create(newUser.id, category, workPermit);
      } else if (role === "Customer") {
        await customerService.create(newUser.id, parseInt(monthlyIncome));
      }
    } catch (error) {
      await userService.deleteUserFromDB(newUser.id);
      throw error;
    }

    const token = jwt.sign({ id: newUser.id, role }, secretKey, { expiresIn: '30m' });
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadRegMobile({ jwt: token, newUser }, newUser.id, email));

  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await authService.disconnect();
  }
}

async function registerEmployee(req, res) {
  try {
    const salt = await bcrypt.genSalt();
    const { name, email, phone, birth, password } = req.body;

    const newUser = await userService.create(name, "Employee", email, phone, birth, await bcrypt.hash(password, salt));
    const account = await accountService.create(newUser.id, 0, "Checking");

    if (newUser && account) {
      console.log("New Employee created successfully ID", newUser.id);
      await logServer(req, res); // Call the logServer function before returning the response
      res.status(201).json(await makePayload(newUser, req.user.id));
    } else {
      console.log("Error creating new Employee");
      await logServer(req, res); // Call the logServer function before returning the response
      res.status(400).json({ message: 'Error creating new Employee' });
    }

  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await authService.disconnect();
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);

    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    } else if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '30m' });
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
      userAccounts = await accountService.findCheckingById(user.id);
      await logServer(req, res); // Call the logServer function before returning the response
      return res.json(await makePayloadMobile({ jwt: token, user, userAccounts }, user.id));
    } else {
      let error = new Error("Wrong password");
      error.meta = { code: "409", error: 'Password is wrong' };
      throw error;
    }
  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await authService.disconnect();
  }
}

async function loginDashboard(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);
    if (!["Admin", "Employee"].includes(user.role)) {
      let error = new Error("Unauthorized");
      error.meta = { code: "401", error: 'User not unauthorized to login' };
      throw error;
    }

    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    } else if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '30m' });
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
      await logServer(req, res); // Call the logServer function before returning the response
      return res.json(await makePayload({ jwt: token }, user.id));
    } else {
      let error = new Error("Wrong password");
      error.meta = { code: "409", error: 'Password is wrong' };
      throw error;
    }
  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await authService.disconnect();
  }
}

async function logout(req, res) {
  try {
    const token = req.body.jwt;

    revokedTokens.add(token);

    res.clearCookie('jwt');
    await logServer(req, res); // Call the logServer function before returning the response
    res.json({ message: 'Logout successful' });
  } catch (error) {
    await handleError(error, res, req);
  }
}

module.exports = { register, login, logout, loginDashboard, registerEmployee };
