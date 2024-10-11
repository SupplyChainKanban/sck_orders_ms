import { OrderStatus } from "@prisma/client";


export const orderStatusList = [
    OrderStatus.BACKLOG,
    OrderStatus.TO_BUY,
    OrderStatus.IN_BUYING_PROCESS,
    OrderStatus.BOUGHT,
    OrderStatus.DISMISSED,
]

export enum predictionStatus {
    PENDING = 'PENDING',
    CREATION_DONE = 'CREATION_DONE',
    UPDATED_DONE = 'UPDATED_DONE',
    PROCESS_DONE = 'PROCESS_DONE',
    ERROR = 'ERROR',
}

