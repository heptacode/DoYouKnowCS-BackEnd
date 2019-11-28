import * as express from "express";
import * as https from "https";
import { readFileSync } from "fs";

import * as cors from "cors";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as compression from "compression";

import "dotenv/config";

import Log from "./util/logger";
import getMeal from "./lib/getMeal";

const app: express.Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());

app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.json({ limit: "500mb" }));

app.get("/", (req, res) => {
  getMeal("/").then(data => {
    res.send(data);
  });
});

app.get("/monthly", (req, res) => {
  getMeal("monthly").then(data => {
    res.send(data);
  });
});

app.get("/monthly/:p", (req, res) => {
  getMeal(parseInt(req.params.p)).then(data => {
    res.send(data);
  });
});

app.get("/allergy", (req, res) => {
  res.send(JSON.stringify(require("./lib/allergy.json")));
});

app.listen(process.env.HTTP_PORT || 80, () => {
  Log.i(`Listening on http://${process.env.HTTP_HOST || "localhost"}:${process.env.HTTP_PORT || 80}`);
});

const httpsOptions = {
  cert: readFileSync("cert/cert.pem"),
  key: readFileSync("cert/key.pem")
};
https.createServer(httpsOptions, app).listen(process.env.HTTPS_PORT || 443, () => {
  Log.i(`Listening on https://${process.env.HTTPS_HOST || "localhost"}:${process.env.HTTPS_PORT || 443}`);
});

export default app;
