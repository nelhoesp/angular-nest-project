import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Repository } from 'typeorm';
import { Poliza } from 'src/polizas/entities/poliza.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Poliza)
    private readonly polizaRepository: Repository<Poliza>,
  ) {}

  async create(createPagoDto: CreatePagoDto) {
    const poliza = await this.polizaRepository.findOne({
      where: { numero_poliza: createPagoDto.poliza },
    });

    if (!poliza) {
      throw new BadRequestException(
        `Poliza with numero_poliza ${createPagoDto.poliza} not found`,
      );
    }

    const pago = this.pagoRepository.create({
      cuota: createPagoDto.cuota,
      empresa_pagadora: createPagoDto.empresa_pagadora,
      medio_pago: createPagoDto.medio_pago,
      banco: createPagoDto.banco,
      numero_operacion: createPagoDto.numero_operacion,
      fecha_pago: createPagoDto.fecha_pago,
      importe: createPagoDto.importe,
      tipo_cambio: createPagoDto.tipo_cambio,
      equivalente_soles: createPagoDto.equivalente_soles,
      poliza,
    });
    return await this.pagoRepository.save(pago);
  }

  async findAll() {
    return await this.pagoRepository.find();
  }

  async findOne(id: number) {
    return await this.pagoRepository.findOneBy({ id });
  }

  async update(id: number, updatePagoDto: UpdatePagoDto) {
    const pago = await this.pagoRepository.findOneBy({ id });

    if (!pago) {
      throw new BadRequestException(`Pago con id ${id} no encontrado`);
    }

    let poliza: Poliza | undefined;
    if (updatePagoDto.poliza) {
      poliza = (await this.polizaRepository.findOne({
        where: { numero_poliza: updatePagoDto.poliza },
      })) ?? undefined;

      if (!poliza) {
        throw new BadRequestException(
          `Poliza con numero_poliza ${updatePagoDto.poliza} no encontrada`,
        );
      }
    }

    return await this.pagoRepository.save({
      ...pago,
      ...updatePagoDto,
      poliza,
    });
  }

  async remove(id: number) {
    return await this.pagoRepository.delete(id);
  }
}
