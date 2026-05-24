import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return {
      project: 'Reserva Aí! API',
      version: '1.0.0',
      status: 'Online',
      documentation: '/api/v1/docs',
      message: 'Bem-vindo ao núcleo de gestão inteligente do Reserva Aí!',
      timestamp: new Date().toISOString(),
    };
  }
}
