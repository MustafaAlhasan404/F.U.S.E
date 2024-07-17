const { PrismaClient, Prisma, Role } = require('@prisma/client');
const { logServerError } = require('./logController');
const prisma = new PrismaClient();

async function handleError(error, res, req) {
  let error_message = "";
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      error_message = `Foreign key constraint failed on the field ${error.meta.field_name}`;
      res.status(409).json({ error: error_message });
    } else if (error.code === "P2002") {
      error_message = `${error.meta.modelName} Unique constraint failed on the fields, fields: ${error.meta.target}`;
      res.status(409).json({ error: error_message, fields: `${error.meta.target}` });
    }
  } else if (error .code === "ERR_INVALID_ARG_TYPE") {
    error_message = `Invalid argument type (decryption error)`;
    res.status(409).json({ error: error_message });
  } else if (error.meta) {
    error_message = error.meta.error;
    res.status(409).json(error.meta);
  } else {
    error_message = error;
    console.log(error);
    res.status(500).json({ error: 'An unknown error occurred' });
  }


  await logServerError(req, res, error_message);
}

module.exports = { handleError };