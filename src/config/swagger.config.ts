import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerConfigInit(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const swaggerEP = configService.get('App.SWAGGER_ENDPOINT');
  const swaggerTITLE = configService.get('App.SWAGGER_TITLE');
  const swaggerDESC = configService.get('App.SWAGGER_DESCRIPTION');
  const swaggerVER = configService.get('App.SWAGGER_VERSION');
  const swaggerTAG = configService.get('App.SWAGGER_ADD_TAG');

  const config = new DocumentBuilder()
    .setTitle(swaggerTITLE)
    .setDescription(swaggerDESC)
    .setVersion(swaggerVER)
    .addTag(swaggerTAG)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerEP, app, document);
}
