const Joi = require('joi');
const { Role, AccountType, AccountStatus, userStatus, TransactionType } = require('@prisma/client');

const MerchantCategories = [
  'Rent/Mortgage',
  'Healthcare',
  'Insurance',
  'Utilities',
  'Food/Groceries',
  'Childcare',
  'Transportation',
  'Personal Spending',
  'Home Goods',
  'Clothing',
  'Pets',
  'Restaurants',
  'Travel & Entertainment',
  'Electronics',
  'Beauty Products',
  'Services',
  'Subscriptions',
];

// key
const keySchema = Joi.object({
  email: Joi.string().email().required(),
}).unknown();

// Auth

const signUpSchema = Joi.object({
  name: Joi.string().required(),
  role: Joi.string().valid(...Object.values(Role)).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).required(),
  birth: Joi.string().pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/).required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  rPassword: Joi.ref('password'),
  category: Joi.string().valid(...MerchantCategories).optional().allow('', null),
  workPermit: Joi.string().optional().allow(''),
  monthlyIncome: Joi.number().optional().allow(''),
  // category: Joi.string().valid(...MerchantCategories).when('role', { is: 'Merchant', then: Joi.required() }),
  // workPermit: Joi.string().when('role', { is: 'Merchant', then: Joi.required() }),
  // monthlyIncome: Joi.number().when('role', { is: 'Customer', then: Joi.required() }),
});

const signUpSchemaEmployee = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).required(),
  birth: Joi.string().pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/).required(),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  rPassword: Joi.ref('password'),
});

const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Account

const createAccountSchema = Joi.object({
  type: Joi.string().valid(...Object.values(AccountType)).required(),
});

const updateAccountSchema = Joi.object({
  userId: Joi.number().integer(),
  balance: Joi.number(),
  type: Joi.string().valid(...Object.values(AccountType)),
  status: Joi.string().valid(...Object.values(AccountStatus)),
  name: Joi.string(),
});

// Beneficiary

const createBeneficiarySchema = Joi.object({
  acceptUser: Joi.number().integer().required(),
  requstUser: Joi.number().integer().required(),
});

const updateBeneficiarySchema = Joi.object({
  id: Joi.number().integer().required(),
  accepted: Joi.boolean().required(),
});

// Card

const createCardSchema = Joi.object({
  cardName: Joi.string().required(),
  balance: Joi.number().integer().required(),
  PIN: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
  rPIN: Joi.ref('PIN'),
});

const updateCardSchema = Joi.object({
  cardName: Joi.string().required(),
  accountNumber: Joi.string().length(20).pattern(/^[0-9]+$/),
  expiryDate: Joi.date().iso().required(),
  physical: Joi.boolean().required(),
});

const updatePINSchema = Joi.object({
  PIN: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
  rPIN: Joi.ref('PIN'),
});

const updateBalanceSchema = Joi.object({
  amount: Joi.number().integer().required(),
  type: Joi.string().valid(...["Deposit", "Withdraw"]).required(),
});

// Merchant

const updateMerchantSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).required(),
  birth: Joi.string().pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/).required(),
  status: Joi.string().valid(...Object.values(userStatus)).required(),
  category: Joi.string().valid(...MerchantCategories).required(),
  workPermit: Joi.string().required(),
});

const generateMerchantBill = Joi.object({
  merchantId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  details: Joi.string().optional().allow(''),
})

// Transaction

const createTransferSchema = Joi.object({
  type: Joi.string().valid(...Object.values(TransactionType)).required(),
  destinationAccount: Joi.string().length(20).pattern(/^[0-9]+$/).required(),
  sourceAccount: Joi.string().length(20).pattern(/^[0-9]+$/),
  amount: Joi.number().positive().required(),
  details: Joi.string().optional().allow(''),
});

const createDWSchema = Joi.object({
  account: Joi.string().length(20).pattern(/^[0-9]+$/).required(),
  amount: Joi.number().positive().required(),
  details: Joi.string().optional().allow(''),
});

const updateTransactionSchema = Joi.object({
  sourceAccount: Joi.string().length(20).pattern(/^[0-9]+$/).required(),
  destinationAccount: Joi.string().length(20).pattern(/^[0-9]+$/).required(),
  amount: Joi.number().positive().required(),
  details: Joi.string().optional().allow(''),
});

// User

const updateUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).required(),
  birth: Joi.string().pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/).required(),
  status: Joi.string().valid(...Object.values(userStatus)).required(),
});

// Bill

const payBillSchema = Joi.object({
  cardId: Joi.string().length(16).pattern(/^[0-9]+$/).required(),
  cvv: Joi.number().positive().required(),
  month: Joi.string().max(2).pattern(/^[0-9]+$/).required(),
  year: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
});

const createBillSchema = Joi.object({
  amount: Joi.number().integer().required(),
  details: Joi.string().optional().allow(''),
});


module.exports = {
  signUpSchema,
  signInSchema,
  createAccountSchema,
  updateAccountSchema,
  createBeneficiarySchema,
  updateBeneficiarySchema,
  createCardSchema,
  updateCardSchema,
  updateMerchantSchema,
  createBillSchema,
  createTransferSchema,
  createDWSchema,
  payBillSchema,
  updateUserSchema,
  signUpSchemaEmployee,
  updateTransactionSchema,
  updatePINSchema,
  updateBalanceSchema,
  payBillSchema,
  keySchema,
  generateMerchantBill
};
