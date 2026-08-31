import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter totais consolidados individuais e gerais do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo consolidado do dashboard retornado com sucesso.',
    type: DashboardResponseDto,
  })
  async getDashboard(): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardSummary();
  }
}
