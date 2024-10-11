import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {

    @IsNotEmpty()
    @IsString()
    public materialID: string;



    @IsNotEmpty()
    @IsNumber()
    public orderQuantity: number;


    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    public predictedDate: Date;


    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public predictionID: string;




}
