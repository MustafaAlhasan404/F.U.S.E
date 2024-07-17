const beneficiarieService = require('../services/beneficiarieService');
const { handleError } = require('./errorController');
const validate = require('./validateController');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

async function index(req, res) {
  try {
    const allBeneficiaries = await beneficiarieService.findAll();
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(allBeneficiaries, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function show(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));

    const beneficiaries = await beneficiarieService.findByUserId(id);

    if (beneficiaries.length <= 0) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Beneficiaries not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(beneficiaries, req.user.id));

  } catch (error) {
    await handleError(error, res, req);
  }
}

async function store(req, res) {
  try {
    const { acceptUser, requstUser } = req.body;

    const beneficiaries = await beneficiarieService.find(requstUser, acceptUser);

    if (beneficiaries) {
      if (!beneficiaries.accepted && beneficiaries.acceptUser === requstUser) {
        await beneficiarieService.updateById(beneficiaries.id, { accepted: true });
        await logServer(req, res); // Call the logServer function before returning the response
        return res.status(201).json(await makePayload({ message: 'Beneficiaries true' }, req.user.id));
      } else {
        await logServer(req, res); // Call the logServer function before returning the response
        return res.status(409).json(await makePayload({ message: 'Requset already sent' }, req.user.id));
      }
    }

    await beneficiarieService.create(requstUser, acceptUser);
    await logServer(req, res); // Call the logServer function before returning the response
    return res.status(201).json(await makePayload({ message: 'sent' }, req.user.id));

  } catch (error) {
    await handleError(error, res, req);
  }
}

async function update(req, res) {
  try {
    const { id, accepted } = req.body;

    const beneficiarie = await beneficiarieService.findById(id);

    if (beneficiarie) {
      await beneficiarieService.updateById(id, { accepted });
    }

  } catch (error) {
    await handleError(error, res, req);
  }
}

async function destroy(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const deletedBeneficiarie = await beneficiarieService.deleteById(id);

    if (!deletedBeneficiarie) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'Beneficiaries not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload({ message: 'Beneficiarie deleted successfully' }, req.user.id));

  } catch (error) {
    await handleError(error, res, req);
  }
}

module.exports = { index, show, store, update, destroy };
