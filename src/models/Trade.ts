import mongoose, { Document } from "mongoose";
import { TradeOutput } from "../constants/limitOrdersConstants/LimitOrdersAbi";
import { tai64toUnix } from "../utils/tai64toUnix";

export interface ITrade {
  order_id: number;
  asset0: string;
  amount0: string;
  asset1: string;
  amount1: string;
  timestamp: number;
}

export const tradeOutputToITrade = (trade: TradeOutput): ITrade => ({
  order_id: trade.order_id.toNumber(),
  asset0: trade.asset0.value,
  amount0: trade.amount0.toString(),
  asset1: trade.asset1.value,
  amount1: trade.amount1.toString(),
  timestamp: tai64toUnix(trade.timestamp.toString()),
});

export type TradeDocument = Document & ITrade;

const TradeSchema = new mongoose.Schema({
  asset0: { type: String, required: true },
  amount0: { type: String, required: true },
  asset1: { type: String, required: true },
  amount1: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

export const Trade = mongoose.model<TradeDocument>("Trade", TradeSchema);
