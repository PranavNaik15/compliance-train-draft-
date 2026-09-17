import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        // If controller/service threw custom payload object (like { success: false, message: ... })
        responseBody = res;
      } else {
        // Fallback for default NestJS HttpException
        if (status === HttpStatus.NOT_FOUND) {
          responseBody = {
            success: false,
            message: `Route ${request.method} ${request.originalUrl || request.url} not found.`,
          };
        } else {
          responseBody = {
            success: false,
            message: res || 'HTTP Exception',
          };
        }
      }

      // Check if it's a default 404 message from Nest router (e.g. Cannot GET /api/foo)
      if (
        status === HttpStatus.NOT_FOUND &&
        responseBody?.message &&
        typeof responseBody.message === 'string' &&
        responseBody.message.startsWith('Cannot ')
      ) {
        responseBody = {
          success: false,
          message: `Route ${request.method} ${request.originalUrl || request.url} not found.`,
        };
      }
    } else {
      const error = exception as Error;
      console.error('Unhandled server error:', error);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        success: false,
        message: 'Internal server error',
        error: error?.message || 'Unknown error',
      };
    }

    response.status(status).json(responseBody);
  }
}
