import {Controller, HttpServer} from "../index";
import {RequestHandler} from "express";
import { getAuth, signInWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as admin from "firebase-admin";
import {accountsService} from "../../../core/services/accounts-service";
import {UserClientModel} from "../../../core/data/models/user/client/user-client-model";
import {HttpResponseError} from "../../../core/utils/http-response-error";
import {environment} from "../../../environment";


export class AccountController implements Controller {

    initialize(httpServer: HttpServer): void {
       // httpServer.post ('/account', this.createAccount.bind(this));
        httpServer.post ('/login', this.loginAccount.bind(this));
    }

    private readonly createAccount: RequestHandler = async (req, res, next,) => {
        const input: UserClientModel & { password: string, adminKey?: string } = UserClientModel.fromBody(req.body);

        if (input.role == "admin" && !environment.createAccount.adminKeys.includes(input.adminKey)) {
            throw new HttpResponseError(401, "INVALID_ADMIN_KEY", "Please, pass a valid 'adminKey' on body");
        }
        const refreshedUser = await accountsService.createAccount(input, input.password);

        res.send({
            "user": UserClientModel.fromEntity(refreshedUser).toBody(),
        });
        next();
    }

    private readonly loginAccount: RequestHandler = async (req, res, next,) => {
        const input: { password: string, email: string } = req.body;
        // EmailAuthProvider credential for email and password
const credential = EmailAuthProvider.credential('user@example.com', 'userPassword');

signInWithCredential(getAuth(), credential)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log('Signed in with credential:', user);
  })
  .catch((error) => {
    console.error('Error signing in with credential:', error);
  });
        res.send({
            "user": input,
        });

        next();
    }
}

