import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolizasModule } from './polizas/polizas.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    PolizasModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'user',
      password: 'password',
      database: 'db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    PagosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
