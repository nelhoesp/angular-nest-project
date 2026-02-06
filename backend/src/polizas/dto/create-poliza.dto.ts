import { IsString } from "class-validator";

export class CreatePolizaDto {
    @IsString()
    numero_poliza: string;
}
