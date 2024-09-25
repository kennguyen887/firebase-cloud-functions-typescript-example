import {Request, Response, NextFunction} from "express";
import {verifyIdTokenInterceptor} from "./verify-idtoken-interceptor";
import bodyParser from "body-parser";
import {logger} from "firebase-functions";


export const interceptors:Array<(req:Request,res:Response,next:NextFunction) => void> = [
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),

    // Setting default values
    (req, res, next) => {
        req.claims = {} as any;
        next();
    },
    verifyIdTokenInterceptor,
    (req, res, next) => {
        logger.info('Incoming Request', { url: `${req.method} ${req.url}`, headers: req.headers['user-agent'], body: req.body })
        next(); // Pass control to the next middleware/handler
    },
];
