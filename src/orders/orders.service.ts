import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { SCK_NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { predictionStatus } from './enums/data.enum';

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
      console.log({ ordenExistente: existingOrder })

      if (!existingOrder) {
        await this.orders.create({
          data: createOrderDto
        })
        this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.CREATION_DONE })
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
        this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.UPDATED_DONE })
        return;
      } else {
        this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.PROCESS_DONE })
      }

    } catch (error) {
      this.client.emit('update.prediction.status', { id: createOrderDto.predictionID, status: predictionStatus.ERROR })
    }
    return;
  }








  async findAll() {
    return await this.orders.findMany({});
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

      if (status === OrderStatus.TO_BUY) {
        const order = await this.findOne(id);
        this.emitToErpIntegration(id, order.materialID, order.orderQuantity, order.predictedDate)
        console.log({ order })
      }

    } catch (error) {
      // handleExceptions(error, this.logger);
      console.log({ error })
    }
  }

  private emitToErpIntegration(id: string, materialID: string, orderQuantity: number, predictedDate: Date) {
    try {
      this.client.emit('createErpIntegration', {
        materialID,
        orderQuantity,
        predictedDate: predictedDate,
        orderId: id,
      });
    } catch (error) {
      console.log({ error })
      // handleExceptions(error, this.logger)
    }
  }

}
