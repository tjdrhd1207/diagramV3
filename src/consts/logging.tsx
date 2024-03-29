import { createLogger, format, transports } from "winston";

interface TransformableInfoEx {
    level: string;
    message: string;
    [key: string]: any;
}

export const logger = createLogger({
    level: "debug",
    format: format.json(),
    transports: [
        new transports.Console({
            level: "debug",
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
                format.colorize(),
                format.printf((info: TransformableInfoEx) => `[${info.timestamp}] [${info.level}] ${info.message}`)
            )
        })
    ]
});

const isSuccess = (status: number) => {
    return (200 <= status && status <= 299);
}

export const logWebRequest = (request: Request, body: any = undefined) => {
    if (logger && request) {
        const method = request.method;
        const url = request.url;
        const headers = request.headers;
        switch (method) {
            case "GET":
                logger.info(`url: ${url}, method: ${method}`);
                break
            case "POST":
                logger.info(`url: ${url}, method: ${method}, content-length: ${headers.get('Content-Length')}`);
                if (logger.isDebugEnabled()) {
                    logger.debug(`body: ${body}`);
                }
                break
            default:
                
        }
    }
}

export const logWebResponse = (response: Response, body: any = undefined) => {
    if (logger) {
        const status = response.status;
        if (typeof body === "object") {
            logger.info(`status: ${status}, body: ${JSON.stringify(body)}`);
        } else {
            logger.info(`status: ${status}, body: ${body}`);
        }
    }
}

export const logAPIRequest = (url: string, options: RequestInit = {}, body: any = undefined) => {
    if (logger) {
        logger.info(`url: ${url}, options: ${options? JSON.stringify(options) : undefined}, body: ${body}`);
    }
}

export const logAPIResponse = (response: Response, body: any = undefined) => {
    if (logger && response) {
        const status = response.status;
        if (isSuccess(status)) {
            logger.info(`status: ${status}, body: ${body? JSON.stringify(body) : undefined}`);
        } else {
            logger.error(`status: ${status}, body: ${body? JSON.stringify(body) : undefined}`);
        }
    }
}

export const logRawResponse = (response: Response, body: any = undefined) => {
    if (logger && response) {
        const status = response.status;
        const headers = response.headers;
        if (isSuccess(status)) {
            logger.info(`status: ${status}, content-type: ${headers.get("Content-Type")}, body: ${body? body : undefined}`);
        } else {
            logger.error(`status: ${status}, content-type: ${headers.get("Content-Type")}, body: ${body? body : undefined}`);
        }
    }
}