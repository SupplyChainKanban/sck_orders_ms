import { OrderStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { orderStatusList } from "../enums/data.enum";

export class ChangeOrderStatusDto {

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public id: string;

    @IsEnum(OrderStatus, {
        message: `Possible status are ${orderStatusList}`
    })
    public status: OrderStatus;
}