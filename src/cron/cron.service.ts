import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class CronService {

  constructor(private readonly ordersService: OrdersService) {

  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForOrderToBuy() {

    console.log('Verificando por órdenes para comprar')
    const backlogOrders = await this.ordersService.findBacklogs();
    console.log({ backlogOrders })
  }



}
