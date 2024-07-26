/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    // db
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_NAME: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    DATABASE_URL: string;
    // secrets
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
  }
}
