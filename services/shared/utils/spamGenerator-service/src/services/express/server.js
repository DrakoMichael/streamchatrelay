import express from "express";
import routes from "./routes.js";

export default function createSpamGeneratorService() {
    const app = express();

    app.use(express.json());
    app.use("/", routes);

    return app;
}