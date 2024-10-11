import { OrderStatus } from "@prisma/client";


export const orderStatusList = [
    OrderStatus.BACKLOG,
    OrderStatus.TO_BUY,
    OrderStatus.IN_BUYING_PROCESS,
    OrderStatus.BOUGHT,
    OrderStatus.DISMISSED,
]
