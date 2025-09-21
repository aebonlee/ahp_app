import { Request, Response, NextFunction } from 'express';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const sanitizeInput: (text: string) => string;
