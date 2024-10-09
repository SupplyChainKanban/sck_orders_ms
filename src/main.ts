import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger } from '@nestjs/common';

async function main() {
  const logger = new Logger('Orders-Main');


  const app = await NestFactory.create(AppModule);
  await app.listen(envs.port);

  logger.log(`Orders Microservice running on port ${envs.port}`)



}
main();
