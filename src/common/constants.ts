/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require('dotenv');
dotenv.config();

export const jwtSecret = process.env.JWT_SECRET;
export const passwordSaltRounds = parseInt(
  process.env.PASSWORD_SALT_ROUNDS as string,
);
