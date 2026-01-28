import express from "express";
import routes from "./routes.js";

export default function createLogService() {
    const app = express();

    app.use(express.json());
    app.use("/", routes);

    return app;
}