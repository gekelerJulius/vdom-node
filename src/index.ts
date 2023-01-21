import express from "express";
import { JSDOM } from "jsdom";
import canvas from "canvas";
import * as NodeURL from "node:url";
import * as NodeBuffer from "node:buffer";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";

const dom: JSDOM = new JSDOM(
  `<!DOCTYPE html><html lang="en"><body></body></html>`
);

// js-dom
globalThis["document"] = dom.window.document;
globalThis["window"] = dom.window as any;
globalThis["self"] = dom.window as any;
globalThis["DOMParser"] = dom.window.DOMParser;
globalThis["XMLSerializer"] = dom.window.XMLSerializer;
globalThis["navigator"] = dom.window.navigator;
globalThis["getComputedStyle"] = dom.window.getComputedStyle;
globalThis["location"] = dom.window.location;
globalThis["URL"] = dom.window.URL;
globalThis["HTMLElement"] = dom.window.HTMLElement;
globalThis["Element"] = dom.window.Element;

// canvas
globalThis["CanvasRenderingContext2D"] = canvas.CanvasRenderingContext2D as any;
globalThis["Image"] = canvas.Image as any;
globalThis["HTMLCanvasElement"] = canvas.Canvas as any;
globalThis["HTMLImageElement"] = canvas.Image as any;
globalThis["OffscreenCanvas"] = canvas.Canvas as any;
globalThis["OffscreenCanvasRenderingContext2D"] =
  canvas.CanvasRenderingContext2D as any;

// node
globalThis["Blob"] = NodeBuffer.Blob as any;
dom.window.URL.createObjectURL = NodeURL.URL.createObjectURL as any;
dom.window.URL.revokeObjectURL = NodeURL.URL.revokeObjectURL as any;

const rootDiv = document.createElement("div");
rootDiv.id = "root";
document.body.appendChild(rootDiv);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);
const port = 3000;

app.get("/", (req, res) => {
  res.send(
    "Offline Plotly Rendering! Send a POST request with your JSON to /plotly"
  );
});

app.post("/plotly", (req, res) => {
  const jsonPlot = req.body;
  console.log({ jsonPlot });
  const { newPlot } = require("./wrappedPlotlyModule");
  newPlot("root", jsonPlot).then((res) => {
    console.log(res);
  });

  // Get the created svg as a svg file
  const svg = document.querySelector("svg");
  const svgData = new XMLSerializer().serializeToString(svg);

  // Send as JSON
  res.send({ svgData });

  // Save svgBlob to disk
  const fileStream = fs.createWriteStream("test.svg");
  fileStream.write(svgData);
  fileStream.end();
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
