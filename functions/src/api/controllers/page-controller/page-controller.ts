import {Controller, HttpServer} from "../index";
import {RequestHandler} from "express";
import { getAuth, signInWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as admin from "firebase-admin";
import pageService from "../../../core/services/pages-service";
import {UserClientModel} from "../../../core/data/models/user/client/user-client-model";
import {HttpResponseError} from "../../../core/utils/http-response-error";
import {environment} from "../../../environment";



export class PageController implements Controller {
    

    initialize(httpServer: HttpServer): void {
        const apiPath = '/page';
        httpServer.post(apiPath, this.createPage.bind(this), ['authenticated']);
        httpServer.put(apiPath, this.updatePage.bind(this), ['authenticated']);
    }

    private readonly createPage: RequestHandler = async (req, res, next,) => {
        const page = await pageService.createPage(req.body, req.auth.uid);
        res.send(page);
        next();
    }

    private readonly updatePage: RequestHandler = async (req, res, next,) => {
        const input: { password: string, email: string } = req.body;
        res.send({
            "user": input,
        });

        next();
    }
}

