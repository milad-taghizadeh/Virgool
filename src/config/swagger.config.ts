import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerConfigInit(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Online Education')
    .setDescription('api endpoints of Online Education system')
    .setVersion('1.0')
    .addTag('TEST')
    .build();

  const configService = app.get(ConfigService);
  const swaggerEP = configService.get('App.SWAGGER_ENDPOINT');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerEP, app, document);
}
