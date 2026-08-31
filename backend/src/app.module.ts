import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PessoasModule } from './modules/pessoas/pessoas.module';
import { TransacoesModule } from './modules/transacoes/transacoes.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PessoasModule,
    TransacoesModule,
    DashboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
