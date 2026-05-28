import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  private logDir: string;
  private logFilePath: string;
  private useFileLogging = true;

  constructor() {
    this.logDir = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), 'logs');
    this.logFilePath = path.join(this.logDir, 'app.log');
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch {
      this.useFileLogging = false;
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '-';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const timestamp = new Date().toISOString();
      const clientIp = ip || req.socket.remoteAddress || '-';

      const logMessage = `${timestamp} | ${clientIp} | ${method} | ${originalUrl} | ${statusCode} | ${duration}ms | ${userAgent}`;

      this.logger.log(logMessage);

      if (this.useFileLogging) {
        this.writeToFile(logMessage);
      }
    });

    next();
  }

  private writeToFile(message: string): void {
    const logLine = message + '\n';
    try {
      fs.appendFileSync(this.logFilePath, logLine);
    } catch (err) {
      console.error('[Logger] Erro ao escrever no log:', err);
    }
  }
}