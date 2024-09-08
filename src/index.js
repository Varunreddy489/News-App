import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";

import router from "./routes/api.js";
import logger from "./config/logger.js";
import { limiter } from "./config/ratelimiter.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(fileUpload());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);


app.listen(PORT, () => {
  console.log(`Server-${PORT}`);
});
