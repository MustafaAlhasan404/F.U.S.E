const userService = require('../services/userService');
const validate = require('./validateController');
const { handleError } = require('./errorController');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

async function index(req, res) {
  try {
    const allUsers = await userService.findAll();
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(allUsers, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function show(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const user = await userService.findById(id);

    if (!user) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload(user, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function update(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const { name, email, phone, birth, status } = req.body;

    const oldUser = await userService.findById(id);
    if (!oldUser) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }

    const updatedUser = await userService.updateUser(id, name, email, phone, birth, status);
    await logServer(req, res); 
    return res.status(200).json(await makePayload(updatedUser, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function destroy(req, res) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const deletedUser = await userService.deleteUser(id);

    if (!deletedUser) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }
    await logServer(req, res); // Call the logServer function before returning the response
    return res.json(await makePayload({ message: 'User deleted successfully' }, req.user.id));
  } catch (error) {
    await handleError(error, res, req);
  }
}

async function recived(req, res){
  const userId = req.user.id;
  //const { userId } = req.body;
  
  const recivedAmounts = await userService.findRecived(parseInt(userId));
  
  await logServer(req, res);
  return res.json(await makePayloadMobile({recived: recivedAmounts}, req.user.id));
  //return res.status(201).json({recived: recivedAmounts});
}

async function sent(req, res){
  const userId = req.user.id;
  //const { userId } = req.body;
  
  const sentAmounts = await userService.findSent(parseInt(userId));
  
  await logServer(req, res);
  return res.json(await makePayloadMobile({sent: sentAmounts}, req.user.id));
  //return res.status(201).json({sent: sentAmounts});
}

async function expenses(req, res) {
  const userId = req.user.id;
  //const { userId } = req.body;
  
  const user = await userService.findCustomer(userId);
  if(!user){
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Customer not found/Not customer' };
    throw error;
  }
  const userExpenses = await userService.findExpenses(userId);
  
  await logServer(req, res);
  return res.json(await makePayloadMobile({expenses: userExpenses, monthlyIncome: user.customer.monthlyIncome}, req.user.id));
  //return res.status(201).json({userExpenses, monthlyIncome: user.customer.monthlyIncome});
}

module.exports = { index, show, update, destroy, recived, sent, expenses };
