// tiny wrapper with default env vars

const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT ||  '3001';
const IP = process.env.IP || '127.0.0.1';

export default {
  NODE_ENV,
  PORT,
  IP
};
