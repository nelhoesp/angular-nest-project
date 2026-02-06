import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { PolizasModule } from 'src/polizas/polizas.module';
import { PolizasService } from 'src/polizas/polizas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago]), PolizasModule],
  controllers: [PagosController],
  providers: [PagosService, PolizasService],
  exports: [],
})
export class PagosModule {}
