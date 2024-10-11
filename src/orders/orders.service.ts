import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { SCK_NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

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
    }

    return 'This action adds a new order';
  }








  findAll() {
    return `This action returns all orders`;
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


        console.log({ order })
      }

    } catch (error) {
      // handleExceptions(error, this.logger);
      console.log({ error })
    }
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
