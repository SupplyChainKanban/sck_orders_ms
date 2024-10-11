import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {

  @Cron(CronExpression.EVERY_MINUTE)
  checkForOrderToBuy() {
    console.log('Verificando por órdenes para comprar')
  }



}
