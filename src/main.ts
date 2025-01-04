import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { CONSOLE_COLORS } from './common/constants/colors.constants';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger ( `${CONSOLE_COLORS.TEXT.MAGENTA}Products Microservice`);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: envs.rabbitmqServers,
        queue: "products_queue",
        queueOptions: {
          durable: true,
        },
        noAck: false,
        socketOptions: {
          heartbeat:60,
        },
      },
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

  await app.listen();

  logger.log(`${CONSOLE_COLORS.TEXT.CYAN}Running on port ${envs.port}`);
}
bootstrap();


