import * as express from "express";
import * as https from "https";
import { readFileSync } from "fs";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

import * as cors from "cors";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as compression from "compression";

import "dotenv/config";

import Log from "./util/logger";
import { fetchMeal, getRawMeal, getRecentMeal, JgetRecentMeal, getMonthlyMeal, JgetMonthlyMeal, returnCache } from "./lib/getMeal";

const app: express.Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());

app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send(getRecentMeal());
});

app.get("/J", (req, res) => {
  res.send(JgetRecentMeal());
});

app.get("/raw", (req, res) => {
  res.send(getRawMeal());
});

app.get("/monthly", (req, res) => {
  res.send(getMonthlyMeal(moment(new Date()).format("YYYY-MM")));
});

app.get("/Jmonthly", (req, res) => {
  res.send(JgetMonthlyMeal(moment(new Date()).format("YYYY-MM")));
});

app.get("/monthly/:p", (req, res) => {
  res.send(getMonthlyMeal(req.params.p));
});

app.get("/Jmonthly/:p", (req, res) => {
  res.send(JgetMonthlyMeal(req.params.p));
});

app.get("/fetch", (req, res) => {
  fetchMeal().then(data => {
    res.send(data);
  });
});

app.get("/cache", (req, res) => {
  res.send(returnCache());
});

app.get("/allergy", (req, res) => {
  res.send(JSON.stringify(require("./lib/allergy.json")));
});

/*app.listen(process.env.HTTP_PORT || 80, () => {
  Log.i(`Listening on http://${process.env.HTTP_HOST || "localhost"}:${process.env.HTTP_PORT || 80}`);
});*/

const httpsOptions = {
  cert: readFileSync("cert/cert.pem"),
  key: readFileSync("cert/key.pem")
};
https.createServer(httpsOptions, app).listen(process.env.HTTPS_PORT || 3030, () => {
  Log.i(`Listening on https://${process.env.HTTPS_HOST || "localhost"}:${process.env.HTTPS_PORT || 3030}`);
});

fetchMeal();

export default app;
