import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {

  @Cron(CronExpression.EVERY_10_SECONDS)
  checkForOrderToBuy() {
    console.log('Verificando por órdenes para comprar')
  }



}
