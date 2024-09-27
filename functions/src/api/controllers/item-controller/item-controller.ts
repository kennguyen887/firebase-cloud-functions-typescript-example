import {Controller, HttpServer} from "../index";
import {RequestHandler} from "express";
import { getAuth, signInWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as admin from "firebase-admin";
import itemService from "../../../core/services/item-service";
import {UserClientModel} from "../../../core/data/models/user/client/user-client-model";
import {HttpResponseError} from "../../../core/utils/http-response-error";
import {environment} from "../../../environment";



export class ItemController implements Controller {
    

    initialize(httpServer: HttpServer): void {
        const apiPath = '/item';
        httpServer.post(apiPath, this.createItem.bind(this), ['authenticated']);
        httpServer.put(apiPath, this.updateItem.bind(this), ['authenticated']);
    }

    private readonly createItem: RequestHandler = async (req, res, next,) => {
        const item = await itemService.createItem(req.body, req.auth.uid);
        res.send(item);
        next();
    }

    private readonly updateItem: RequestHandler = async (req, res, next,) => {
        const input: { password: string, email: string } = req.body;
        res.send({
            "user": input,
        });

        next();
    }
}

