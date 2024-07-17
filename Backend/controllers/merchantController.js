const merchantService = require('../services/merchantService');
const billServices = require('../services/billServices');
const accountService = require('../services/accountService');
const { handleError } = require('./errorController');
const validate = require('./validateController');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

async function index(req, res) {
  try {
    const allMerchants = await merchantService.findAll();
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(allMerchants, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function show(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id));

    const merchant = await merchantService.findById(id);

    if (!merchant) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Merchant not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(merchant, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function update(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id));
    const { name, email, phone, birth, status, category, workPermit } = req.body;

    const oldMerchant = await merchantService.findById(id);
    if (!oldMerchant) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Merchant not found' };
      throw error;
    }

    const updatedMerchant = await merchantService.updateById(id, { name, email, phone, birth, status, category, workPermit });
    await logServer(req, res); // Call the logServer function before returning the response
    return res.status(200).json(await makePayload(updatedMerchant, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function destroy(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id));

    const deletedMerchant = await merchantService.deleteMerchant(id);
    if (!deletedMerchant) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Merchant not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload({ message: 'Merchant deleted successfully' }, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function genBill(req, res) {
  try {
    const { merchantId, amount, details, password } = req.body;

    const merchant = await merchantService.findById(merchantId);

    const merchantAccount = await accountService.findCheckingById(merchantId);
    if (!merchantAccount) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Merchant account not found' };
      throw error;
    }

    const bill = await billServices.create(merchantAccount.id, amount, details, merchant.merchant.categoryId);

    logServer(req, res);
    return res.status(201).json({ billID: bill.id })
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function checkBill(req, res) {
  try {
    const billId = parseInt(await validate.isNumber(req.params.id));
    const bill = await billServices.findById(billId);
    if(!bill){
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Bill not found' };
      throw error;
    }

    logServer(req, res);
    return res.status(201).json({ status: bill.status })

  } catch (error) {
    await handleError(error, res, req);
  }
}

module.exports = { index, show, update, destroy, genBill, checkBill };
