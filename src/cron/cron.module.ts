import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  controllers: [],
  providers: [CronService],
  imports: [OrdersModule]
})
export class CronModule { }
