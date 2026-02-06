import { Pago } from "src/pagos/entities/pago.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('polizas')
@Unique(['numero_poliza'])
export class Poliza {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    numero_poliza: string;

    @OneToMany(() => Pago, (pago) => pago.poliza)
    pagos: Pago[];

    @CreateDateColumn()
    created_at: Date;
}
