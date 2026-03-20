import type { Request, Response, NextFunction } from "express";
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err.message);

    res.status(err.status || 500).json({
        error: {
            code: err.code || "INTERNALERROR",
            message: err.message || "Smth wrong with server",
        }
    })
}