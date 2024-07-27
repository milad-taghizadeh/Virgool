import { registerAs } from '@nestjs/config';

export enum ConfigKeys {
  App = 'App',
  Db = 'Db',
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
  SERVER_PORT: 3000,
  SWAGGER_ENDPOINT: 'api-doc',
  SWAGGER_TITLE: 'Virgool-Backend',
  SWAGGER_DESCRIPTION: 'Api endpoints of virgool website',
  SWAGGER_VERSION: '1.2',
  SWAGGER_ADD_TAG: 'TEST',
}));

export const configurations = [AppConfig];
