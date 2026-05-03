import type { Request, Response, NextFunction } from "express";
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const message = String(err?.message ?? "Internal server error");

    if (err?.status && Number.isInteger(err.status)) {
        return res.status(err.status).json({
            error: {
                code: err.code || "ERROR",
                message,
            },
        });
    }
    if (message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({
            error: {
                code: "CONFLICT",
                message,
            },
        });
    }
    if (
        message.includes("NOT NULL constraint failed") ||
        message.includes("CHECK constraint failed") ||
        message.includes("FOREIGN KEY constraint failed")
    ) {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message,
            },
        });
    }
    console.error("Error:", message);
    return res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: "Smth wrong with server",
        },
    });
};