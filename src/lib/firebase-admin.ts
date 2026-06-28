import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

let app: App | undefined;
let database: Database | undefined;

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApp();
    return app;
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? "{}");
  app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
  return app;
}

export function getAdminRtdb(): Database {
  if (!database) database = getDatabase(getAdminApp());
  return database;
}
