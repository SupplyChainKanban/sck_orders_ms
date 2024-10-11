import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { SCK_NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

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

  async findBacklogs() {
    return await this.orders.findMany({
      where: {
        status: 'BACKLOG'
      }
    })
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
