import { Module } from '@nestjs/common';
import { PolizasService } from './polizas.service';
import { PolizasController } from './polizas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poliza } from './entities/poliza.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poliza])],
  controllers: [PolizasController],
  providers: [PolizasService],
  exports: [TypeOrmModule]
})
export class PolizasModule {}
