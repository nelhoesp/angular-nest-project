import { Poliza } from "src/polizas/entities/poliza.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('pagos')
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cuota: string;

    @Column()
    empresa_pagadora: string;

    @Column()
    medio_pago: string;

    @Column()
    banco: string;

    @Column()
    numero_operacion: string;

    @Column()
    fecha_pago: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    importe: number;

    @Column('decimal', { precision: 10, scale: 2 })
    tipo_cambio: number;

    @Column('decimal', { precision: 10, scale: 2 })
    equivalente_soles: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Poliza, (poliza) => poliza.id, {
        eager: true,
    })
    poliza: Poliza;
}
