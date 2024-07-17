const isEMail = require("isemail");
const { Role, MerchantCategory, userStatus, AccountType, AccountStatus, TransactionType } = require('@prisma/client');

// This file was created before using joi for validation, I kept it bec I am still using some of the function 

async function matchPassword(password, rPassword) {
  password = await checkEmpty(password, "password");
  rPassword = await checkEmpty(rPassword, "password");

  error = new Error("password error");
  if (parseInt(password.length) < 6) {
    error.meta = { error: "Password is short" }; throw error;
  } else if (password != rPassword) {
    error.meta = { error: "Passwords don`t match" }; throw error;
  }

  return password;
}

async function isEmail(email) {
  email = await checkEmpty(email, "email");

  if (isEMail.validate(email)) {
    return email;
  } else {
    error = new Error("Invaled email");
    error.meta = { error: `Invaled email format`, paramName: "Email" };
    throw error;
  }
}

async function isRole(role) {
  role = await checkEmpty(role, "role")

  if (role in Role) {
    return role;
  } else {
    error = new Error("Invaled role");
    error.meta = { error: `Invaled role format`, paramName: "role" };
    throw error;
  }
}

async function isPhone(phone) {
  phone = await checkEmpty(phone);
  const re = new RegExp("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$");
  if (re.test(phone)) {
    return phone;
  } else {
    error = new Error("Invaled phone");
    error.meta = { error: `Invaled phone format`, paramName: "phone" };
    throw error;
  }
}

async function isDate(date) {
  date = await checkEmpty(date);
  const re = new RegExp("^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$");
  if (!re.test(date)) {
    return date;
  } else {
    error = new Error("Invaled date");
    error.meta = { error: `Invaled date format (valid: dd/mm/yyyy)`, paramName: "date" };
    throw error;
  }
}

async function isNumber(number, name) {
  number = await checkEmpty(number, name);
  if (isNaN(number)) {
    error = new Error(`Invaled ${name}`);
    error.meta = { error: `Invaled ${name} must be a number`, paramName: name };
    throw error;
  }
  return number;
}

async function checkEmpty(parameter, paramName) {
  if (!parameter || parseInt(String.toString(parameter).trim().length) <= 0) {
    error = new Error("Empty parameter");
    error.meta = { error: `Empty parameter`, paramName };
    throw error;
  }
  return parameter.trim();
}

async function isUserStatus(status) {
  status = await checkEmpty(status, "UserStatus");

  if(status in userStatus){
    return status;
  }else{
    error = new Error("Invaled status");
    error.meta = { error: `Invaled status format`, paramName: "status" };
    throw error;
  }
}

async function isAccountType(type) {
  type = await checkEmpty(type, "AccountType");

  if(type in AccountType){
    return type;
  }else{
    error = new Error("Invaled type");
    error.meta = { error: `Invaled type format`, paramName: "type" };
    throw error;
  }
}

async function isAccountStatus(status) {
  status = await checkEmpty(status, "AccountStatus");

  if(status in AccountStatus){
    return status;
  }else{
    error = new Error("Invaled status");
    error.meta = { error: `Invaled status format`, paramName: "status" };
    throw error;
  }
}

async function isMerchantCategory(category) {
  category = await checkEmpty(category, "MerchantCategory");

  if(category in MerchantCategory){
    return category;
  }else{
    error = new Error("Invaled category");
    error.meta = { error: `Invaled category format`, paramName: "category" };
    throw error;
  }
}

async function isTransactionType(type) {
  type = await checkEmpty(type, "transactionType");

  if(type in TransactionType){
    return type;
  }else{
    error = new Error("Invaled type");
    error.meta = { error: `Invaled type format`, paramName: "type" };
    throw error;
  }
}


async function notEmpty(...args) {
  error = new Error("Empty parameter");
  args.forEach((arg, index) => {
    if (!arg) {
      const paramName = `arg${index + 1}`;
      error.meta = { error: `Empty parameter`, paramName };
      throw error;
    }
  });
}

module.exports = {
  matchPassword,
  notEmpty,
  isEmail,
  isRole, 
  isPhone, 
  isDate, 
  isNumber, 
  isUserStatus, 
  isMerchantCategory, 
  isAccountType, 
  isAccountStatus,
  isTransactionType,
  checkEmpty 
};
