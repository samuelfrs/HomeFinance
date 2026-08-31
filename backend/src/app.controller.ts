import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Status')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Verificar status de integridade da API' })
  @ApiResponse({ status: 200, description: 'API ativa e operante.' })
  getHealth() {
    return {
      status: 'online',
      name: 'HomeFinance API',
      message: 'API do HomeFinance está ativa e operando com sucesso!',
      version: '1.0.0',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
