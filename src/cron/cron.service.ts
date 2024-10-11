import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class CronService {

  constructor(private readonly ordersService: OrdersService) {

  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForOrderToBuy() {

    const backlogOrders = await this.ordersService.findToBuy();
    // console.log({ backlogOrders })

    const now = new Date();

    for (const order of backlogOrders) {
      const daysToPurchase = (order.predictedDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

      if (daysToPurchase <= 250) {
        await this.ordersService.updateOrderStatus({ id: order.id, status: OrderStatus.TO_BUY });
      }

      // console.log({ daysToPurchase })

    }





  }



}
