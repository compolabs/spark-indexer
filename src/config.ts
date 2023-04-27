import path from "path";
import { config } from "dotenv";
import { loadVar } from "./utils";

config({ path: path.join(__dirname, "../.env") });

export const mongoUrl = loadVar("MONGO_URL");
export const port = loadVar("PORT", true);
export const privateKey = loadVar("PRIVATE_KEY");
export const contractAddress = loadVar("CONTRACT_ADDRESSES");
export const nodeUrl = loadVar("NODE_URL");
