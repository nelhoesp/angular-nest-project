import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poliza } from './entities/poliza.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PolizasService {

  constructor(
    @InjectRepository(Poliza)
    private readonly polizaRepository: Repository<Poliza>
  ) {}

  async create(createPolizaDto: CreatePolizaDto) {
    const { numero_poliza } = createPolizaDto;

    const existe = await this.polizaRepository.findOne({
      where: { numero_poliza },
    });

    if (existe) {
      throw new ConflictException(
        `La póliza con número ${numero_poliza} ya existe`,
      );
    }

    const poliza = this.polizaRepository.create(createPolizaDto);
    return await this.polizaRepository.save(poliza);
  }

  async findAll() {
    return await this.polizaRepository.find();
  }

  async findOne(id: number) {
    return await this.polizaRepository.findOneBy({ id });
  }

  async update(id: number, updatePolizaDto: UpdatePolizaDto) {
    const poliza = await this.polizaRepository.findOne({
      where: { id },
    });

    if (!poliza) {
      throw new NotFoundException(`La póliza con id ${id} no existe`);
    }

    if (updatePolizaDto.numero_poliza) {
      const existe = await this.polizaRepository.findOne({
        where: {
          numero_poliza: updatePolizaDto.numero_poliza,
        },
      });

      if (existe) {
        throw new ConflictException(
          `La póliza con número ${updatePolizaDto.numero_poliza} ya existe`,
        );
      }
    }

    Object.assign(poliza, updatePolizaDto);
    return await this.polizaRepository.save(poliza);
  }

  async remove(id: number) {
    const result = await this.polizaRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`La póliza con id ${id} no existe`);
    }

    return { message: `Póliza con id ${id} eliminada correctamente` };
  }
}

