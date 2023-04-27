import mongoose, { Document } from "mongoose";

export interface ITrade {
  asset0: string;
  amount0: string;
  asset1: string;
  amount1: string;
  timestamp: number;
}

export type TradeDocument = Document & ITrade;

const TradeSchema = new mongoose.Schema({
  asset0: { type: String, required: true },
  amount0: { type: String, required: true },
  asset1: { type: String, required: true },
  amount1: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

export const Trade = mongoose.model<TradeDocument>("Trade", TradeSchema);
