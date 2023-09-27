/*eslint-env node*/
// tiny wrapper with default env vars

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3001;

export default {
  NODE_ENV,
  PORT,
};
