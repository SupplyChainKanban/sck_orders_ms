import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { SCK_NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { predictionStatus } from './enums/data.enum';
import { firstValueFrom } from 'rxjs';
import { sleep } from 'src/helpers/utilities';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  constructor(@Inject(SCK_NATS_SERVICE) private readonly client: ClientProxy) {
    super()
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Orders DB connected')
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const existingOrder = await this.orders.findFirst({
        where: {
          materialID: createOrderDto.materialID,
          status: {
            notIn: ['BOUGHT', 'DISMISSED']
          }
        }
      })

      if (!existingOrder) {
        const orderCreated = await this.orders.create({
          data: createOrderDto
        })
        this.client.emit('order.status.changed', {});
        this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.CREATION_DONE })
        // this.client.emit('order.status.changed', {});
        // this.emitToErpIntegration(orderCreated.id, orderCreated.materialID, orderCreated.orderQuantity, orderCreated.predictedDate)
        return;
      }

      if (existingOrder.status === 'BACKLOG') {
        if (
          existingOrder.orderQuantity === createOrderDto.orderQuantity &&
          existingOrder.predictedDate === createOrderDto.predictedDate &&
          existingOrder.predictionID === createOrderDto.predictionID
        ) return;

        await this.orders.update({
          where: { id: existingOrder.id },
          data: {
            orderQuantity: createOrderDto.orderQuantity,
            predictedDate: createOrderDto.predictedDate,
            predictionID: createOrderDto.predictionID,
          }
        })
        this.client.emit('order.status.changed', {});
        this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.UPDATED_DONE })
        return;
      } else {
        this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.PROCESS_DONE })
      }

    } catch (error) {
      this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.ERROR })
    }
  }

  async findAll() {
    const orders = await this.orders.findMany({});
    const ordersList: any[] = [...orders]
    for (const order of ordersList) {
      const dataAnalytics = await firstValueFrom(this.client.send('findOneDataAnalytics', { id: order.dataAnalyticsId }))
      order.materialName = dataAnalytics.materialName;
    }
    return ordersList;
  }

  async findToBuy() {
    return await this.orders.findMany({
      where: {
        status: {
          in: ['BACKLOG', 'TO_BUY']
        }
      }
    })
  }

  async findOne(id: string) {
    return await this.orders.findUnique({
      where: {
        id
      }
    })
  }

  async updateOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    try {
      await this.orders.update({
        where: { id },
        data: { status }
      })
      this.client.emit('order.status.changed', {});

      if (status === OrderStatus.TO_BUY) {
        const order = await this.findOne(id);
        await sleep(1000);
        this.emitToErpIntegration(id, order.materialID, order.orderQuantity, order.predictedDate)
      }

    } catch (error) {
      // handleExceptions(error, this.logger);
      console.log({ error })
    }
  }

  private emitToErpIntegration(id: string, materialID: string, orderQuantity: number, predictedDate: Date) {
    try {
      this.client.emit('send.to.Erp', {
        materialID,
        orderQuantity,
        predictedDate,
        orderId: id,
      });
    } catch (error) {
      console.log({ error })
      // handleExceptions(error, this.logger)
    }
  }

}
