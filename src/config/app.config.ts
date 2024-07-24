import { registerAs } from '@nestjs/config';

export enum ConfigKeys {
  App = 'App',
  Db = 'Db',
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
  SERVER_PORT: 3000,
  SWAGGER_ENDPOINT: 'api-doc',
}));

export const configurations = [AppConfig];
