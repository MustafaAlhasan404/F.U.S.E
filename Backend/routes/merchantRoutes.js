const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { updateMerchantSchema, generateMerchantBill } = require('../validationSchemas');

//router.get('/create', merchantController.create);

//router.get('/', merchantController.index);
//router.get('/:id', merchantController.show);
//router.put('/:id', validateRequest(updateMerchantSchema), merchantController.update);
//router.delete('/:id', merchantController.destroy);
router.post('/generate/bill', validateRequest(generateMerchantBill), merchantController.genBill);
router.get('/check/:id', merchantController.checkBill);

module.exports = router;


// 1. You must have a merchant account in F.U.S.E. 
// 2. Go to your profile and check your ID , "merchantId" = "ID"
// 3. Make a POST req on https://fuse-backend-x7mr.onrender.com/merchant/generate/bill ,with Body: {
// "merchantId": "ID",
// "amount": (Integer) > 0,
// "details": "you bill details"
// }
// to generate bill
// 4. You will receive: { "billID":  (Integer) } 
// 5. Use it to redirect user to https://payment-gateway-dashboard.vercel.app/:billID
// 6. The user will pay the bill there
// 7. To check the bill status req GET on https://fuse-backend-x7mr.onrender.com/merchant/check/:billID
// 8. Only if you receive: { "status": "Paid" } the bill is paid
