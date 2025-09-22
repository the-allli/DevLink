import "dotenv/config";

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,

  STEAM_API_KEY: process.env.STEAM_API_KEY,
  STEAM_API_SECRET: process.env.STEAM_API_SECRET,
};
