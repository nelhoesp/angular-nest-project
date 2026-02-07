import { IsDateString, IsNumber, IsString } from "class-validator";

export class CreatePagoDto {
    @IsString()
    cuota: string;

    @IsString()
    empresa_pagadora: string;

    @IsString()
    medio_pago: string;

    @IsString()
    banco: string;

    @IsString()
    numero_operacion: string;

    @IsDateString()
    fecha_pago: Date;

    @IsString()
    moneda: string;

    @IsNumber()
    importe: number;

    @IsNumber()
    tipo_cambio: number;

    @IsNumber()
    equivalente_soles: number;

    @IsString()
    poliza: string;
}
