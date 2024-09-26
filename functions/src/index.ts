import * as admin from "firebase-admin";
const { onRequest } = require("firebase-functions/v2/https");
import { apiApp } from "./api";
// import {eventTriggers} from "./event-triggers";

export type UserRole = "user" | "admin";

export type MyClaims = "authenticated" | UserRole; // TODO: add OR operation with our own claims;

process.env.TZ = "US/Central"; // TODO: Replace "US/Central" with your timezone. Reference: https://gist.github.com/diogocapela/12c6617fc87607d11fd62d2a4f42b02a

admin.initializeApp();

exports.api = onRequest(apiApp);
// Object.assign(exports, eventTriggers());
