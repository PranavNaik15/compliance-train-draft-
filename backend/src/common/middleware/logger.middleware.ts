import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const time = new Date().toISOString().slice(11, 19);
    console.log(`[${time}] ${req.method} ${req.originalUrl || req.url}`);
    next();
  }
}
