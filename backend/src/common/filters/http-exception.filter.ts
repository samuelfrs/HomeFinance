import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno do servidor';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, any>;
        message = obj.message || obj.mensagem || message;
        error = obj.error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Se a mensagem for um array (ex: class-validator), pegamos a primeira ou formatamos
    const formattedMessage = Array.isArray(message) ? message[0] : message;

    response.status(status).json({
      statusCode: status,
      mensagem: formattedMessage,
      message: formattedMessage,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
