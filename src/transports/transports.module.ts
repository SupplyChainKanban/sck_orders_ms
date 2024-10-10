import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, SCK_NATS_SERVICE } from 'src/config';

const clientModulo = ClientsModule.register([
    {
        name: SCK_NATS_SERVICE,
        transport: Transport.NATS,
        options: {
            servers: envs.sckNatsServers,
        }
    },
])

@Module({
    imports: [clientModulo],
    exports: [clientModulo],
})
export class TransportsModule { }
