import { Module } from '@nestjs/common';
import { TransacoesController } from './transacoes.controller';
import { TransacoesService } from './transacoes.service';

@Module({
  controllers: [TransacoesController],
  providers: [TransacoesService],
  exports: [TransacoesService],
})
export class TransacoesModule {}
