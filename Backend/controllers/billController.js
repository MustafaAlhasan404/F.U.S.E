const billService = require('../services/billServices');
const accountService = require('../services/accountService');
const merchantService = require('../services/merchantService');
const cardService = require('../services/cardService');
const { handleError } = require('./errorController');
const validate = require('./validateController');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

async function show(req, res) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");
    const bill = await billService.findById(id);
    if (!bill) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: "Bill not found" };
      throw error;
    }

    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadMobile(bill, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function store(req, res) {
  try {
    const { amount, details } = req.body;

    const user = await merchantService.findById(req.user.id)
    const dAccount = await accountService.findCheckingById(req.user.id);

    if (!dAccount) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Destination account not found' };
      throw error;
    } else if (dAccount.status !== "Active") {
      let error = new Error("Not Active");
      error.meta = { code: "409", error: `Destination account is not active (${dAccount.status})` };
      throw error;
    } else if (amount <= 0) {
      let error = new Error("Wrong Amount");
      error.meta = { code: "409", error: "Amount must be greater than 0" };
      throw error;
    }

    const bill = await billService.create(dAccount.id , amount, details? details : null, user.merchant.categoryId);

    await logServer(req, res); // Call the logServer function before returning the response
    res.status(201).json(await makePayloadMobile({ bill }, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function pay(req, res) {
  try {
    const id = parseInt(await validate.checkEmpty(req.params.id, "id"));
    const { cardId, cvv, month, year } = req.body;
    const bill = await billService.findById(id);
    const card = await cardService.findById(cardId);
    const expiryDate = new Date(card.expiryDate);

    if (!bill) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Bill not found' };
      throw error;
    } else if (!card) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Card not found' };
      throw error;
    } else if (card.cvv !== cvv, expiryDate.getMonth() + 1 !== parseInt(month), expiryDate.getFullYear() !== parseInt(year)) {
      let error = new Error("Invalid Card Details");
      error.meta = { code: "409", error: `Card details are invalid` };
      throw error;
    } else if (bill.status!== "Pending") {
      let error = new Error("Not Pending");
      error.meta = { code: "409", error: `Bill is not pending (${bill.status})` };
      throw error;
    }

    if(card.balance - bill.amount < 0) {
      let error = new Error("Insufficient Balance");
      error.meta = { code: "409", error: `Card has insufficient balance` };
      throw error;
    }

    const payedBill = await billService.payBill(id, cardId, bill.amount, bill.merchantAccountNumber);
    await logServer(req, res); 
    return res.status(201).json(await makePayloadMobile({ payedBill }, req.user.id));

  }catch (error) {
    await handleError(error, res, req);
  }
}

async function showUnpaid (req, res) {
  try {
    const bills = await billService.findByMerchantId(req.user.id);
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayloadMobile(bills, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

module.exports = {
  store,
  pay,
  show,
  showUnpaid
}
