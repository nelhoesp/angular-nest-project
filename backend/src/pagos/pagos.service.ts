import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Between, Repository } from 'typeorm';
import { Poliza } from 'src/polizas/entities/poliza.entity';
import * as XLSX from 'xlsx';

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
      moneda: createPagoDto.moneda,
      tipo_cambio: createPagoDto.tipo_cambio,
      equivalente_soles: createPagoDto.equivalente_soles,
      poliza,
    });
    return await this.pagoRepository.save(pago);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    fechaDesde?: string,
    fechaHasta?: string,
    empresaPagadora?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro por rango de fechas
    if (fechaDesde && fechaHasta) {
      where.fecha_pago = Between(new Date(fechaDesde), new Date(fechaHasta));
    } else if (fechaDesde) {
      where.fecha_pago = Between(new Date(fechaDesde), new Date());
    } else if (fechaHasta) {
      where.fecha_pago = Between(new Date(0), new Date(fechaHasta));
    }

    // Filtro por empresa pagadora
    if (empresaPagadora) {
      where.empresa_pagadora = empresaPagadora;
    }

    const [data, total] = await this.pagoRepository.findAndCount({
      where,
      take: limit,
      skip: skip,
      order: {
        created_at: 'DESC',
      },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async processExcelFile(buffer: Buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet, { 
        range: 2,
        raw: false
      });

      if (data.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío');
      }

      const results = {
        success: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        const rowNumber = i + 4;

        try {
          const numeroPoliza = row['__EMPTY_1'] || row['N° DOCUMENTO'] || row['N\u00b0 DOCUMENTO'];
          if (!numeroPoliza) {
            results.errors.push(`Fila ${rowNumber}: Campo 'N° DOCUMENTO' es requerido`);
            continue;
          }

          let poliza = await this.polizaRepository.findOne({
            where: { numero_poliza: numeroPoliza.toString() },
          });

          if (!poliza) {
            poliza = this.polizaRepository.create({
              numero_poliza: numeroPoliza.toString(),
            });
            poliza = await this.polizaRepository.save(poliza);
          }

          let fechaPago: Date;
          const fechaValue = row['__EMPTY_8'] || row['FECHA'];
          if (fechaValue) {
            if (typeof fechaValue === 'number') {
              const parsedDate = XLSX.SSF.parse_date_code(fechaValue);
              fechaPago = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
            } else {
              fechaPago = new Date(fechaValue);
            }
          } else {
            fechaPago = new Date();
          }

          const pago = this.pagoRepository.create({
            cuota: (row['__EMPTY_2'] || row['CUOTA'])?.toString() || '',
            empresa_pagadora: (row['__EMPTY_3'] || row['EMPRESA QUE PAGA'])?.toString() || '',
            medio_pago: (row['__EMPTY_5'] || row['MEDIO'])?.toString() || '',
            banco: (row['__EMPTY_6'] || row['BANCO'])?.toString() || '',
            numero_operacion: (row['__EMPTY_7'] || row['# OP.'])?.toString() || '',
            fecha_pago: fechaPago,
            moneda: (row['__EMPTY_9'] || row['MONEDA'])?.toString() || '',
            importe: parseFloat(row['__EMPTY_10'] || row['IMPORTE']) || 0,
            tipo_cambio: parseFloat(row['__EMPTY_11'] || row['T.C.']) || 0,
            equivalente_soles: parseFloat(row['__EMPTY_12'] || row['EQUIV. SOLES']) || 0,
            poliza,
          });

          await this.pagoRepository.save(pago);
          results.success++;
        } catch (error) {
          results.errors.push(
            `Fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          );
        }
      }

      return {
        message: `Proceso completado. ${results.success} registros importados exitosamente.`,
        success: results.success,
        errors: results.errors.length > 0 ? results.errors : undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar el archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }
}