import type { RequestHandler } from 'express'

// Logging request 
// GET /tasks 200 - 3ms
export const requestLoggerv: RequestHandler = (req, res, next) => {
    const start = new Date();
    res.on('finish',() => {
        const elapsedMs = new Date().getTime() - start.getTime();

        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsedMs}ms`)
    });

    next();
}
