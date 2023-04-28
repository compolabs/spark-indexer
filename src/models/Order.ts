import mongoose, { Document } from "mongoose";
import { OrderOutput } from "../constants/limitOrdersConstants/LimitOrdersAbi";
import { TOKENS_BY_SYMBOL } from "../constants";
import BN from "../utils/BN";
import { tai64toUnix } from "../utils/tai64toUnix";

export interface IOrder {
  id: number;
  owner: string;
  asset0: string;
  amount0: string;
  asset1: string;
  amount1: string;
  status: string;
  fulfilled0: string;
  fulfilled1: string;
  timestamp: number;
  matcher_fee: string;
  matcher_fee_used: string;
  type: "SELL" | "BUY";
  price: number;
  market: string;
}

export const orderOutputToIOrder = (order: OrderOutput): IOrder => {
  const BTC = TOKENS_BY_SYMBOL.BTC;
  const USDC = TOKENS_BY_SYMBOL.USDC;
  const type = order.asset0.value === BTC.assetId ? "SELL" : "BUY";
  return {
    id: order.id.toNumber(),
    owner: order.owner.value,
    asset0: order.asset0.value,
    amount0: order.amount0.toString(),
    asset1: order.asset1.value,
    amount1: order.amount1.toString(),
    status: Object.keys(order.status)[0],
    fulfilled0: order.fulfilled0.toString(),
    fulfilled1: order.fulfilled1.toString(),
    timestamp: tai64toUnix(order.timestamp.toString()),
    matcher_fee: order.matcher_fee.toString(),
    matcher_fee_used: order.matcher_fee_used.toString(),
    market: "BTC/USDC",
    type,
    price:
      type === "SELL"
        ? BN.formatUnits(order.amount1.toString(), USDC.decimals)
            .div(BN.formatUnits(order.amount0.toString(), BTC.decimals))
            .toNumber()
        : BN.formatUnits(order.amount0.toString(), USDC.decimals)
            .div(BN.formatUnits(order.amount1.toString(), BTC.decimals))
            .toNumber(),
    // type === "SELL"
    //   ? BN.formatUnits(order.amount0.toString(), BTC.decimals)
    //       .div(BN.formatUnits(order.amount1.toString(), USDC.decimals))
    //       .toNumber()
    //   : BN.formatUnits(order.amount1.toString(), BTC.decimals)
    //       .div(BN.formatUnits(order.amount0.toString(), USDC.decimals))
    //       .toNumber(),
  };
};

export type OrderDocument = Document & IOrder;

const OrderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  owner: { type: String, required: true },
  asset0: { type: String, required: true },
  amount0: { type: String, required: true },
  asset1: { type: String, required: true },
  amount1: { type: String, required: true },
  status: { type: String, required: true },
  fulfilled0: { type: String, required: true },
  fulfilled1: { type: String, required: true },
  timestamp: { type: Number, required: true },
  matcher_fee: { type: String, required: true },
  matcher_fee_used: { type: String, required: true },
  market: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ["SELL", "BUY"], required: true },
});

export const Order = mongoose.model<OrderDocument>("Order", OrderSchema);
