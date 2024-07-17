const accountService = require('../services/accountService');
const { handleError } = require('./errorController');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const validate = require('./validateController');
const { logServer } = require('./logController'); // Import the logServer function
const { makePayloadRegMobile } = require('../middleware/regMobileEncryptionMiddleware');

async function index(req, res) {
  try {
    const allAccounts = await accountService.findAll();
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(allAccounts, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await accountService.disconnect();
  }
}

async function show(req, res) {
  try {
    const id = req.params.id;

    const account = await accountService.findById(id);

    if (!account) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Account not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadMobile(account, req.user.id));

  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await accountService.disconnect();
  }
}

async function showUserAccounts(req, res) {
  try {
    const accounts = await accountService.findByUserId(req.user.id);

    if(!accounts){
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Accounts not found' };
      throw error;
    }

    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadMobile(accounts, req.user.id));

  }catch(error){
    await handleError(error, res, req);
  }
}

async function showUserById(req, res) {
  try {
    const accountUser = await accountService.findUserById(req.params.id);

    if(!accountUser){
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Accounts not found' };
      throw error;
    }

    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadMobile(accountUser, req.user.id));

  }catch(error){
    await handleError(error, res, req);
  }
}

async function store(req, res) {
  try {
    const { type } = req.body;
    const userId = req.user.id;

    const newAccount = await accountService.create(userId, 0, type);
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadRegMobile(newAccount, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await accountService.disconnect();
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const { userId, balance, type, status, name } = req.body;

    const updatedAccount = await accountService.updateById(id, { userId, balance, type, status, name });
    await logServer(req, res); // Call the logServer function before returning the response
    res.json(await makePayload(updatedAccount, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await accountService.disconnect();
  }
}

async function destroy(req, res) {
  try {
    const id = await validate.isNumber(req.params.id, "id");

    const deletedAccount = await accountService.updateById(id, { status: "Inactive" });
    if (!deletedAccount) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Account not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload({ message: 'Account deleted successfully' }, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  } finally {
    await accountService.disconnect();
  }
}

module.exports = { index, show, store, update, destroy, showUserById, showUserAccounts };
