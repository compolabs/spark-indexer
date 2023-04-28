import { initMongo } from "../src/services/mongoService";
import { Trade } from "../src/models/Trade";
import { TOKENS_BY_SYMBOL } from "../src/constants";
import BN from "../src/utils/BN";

describe("items", () => {
  beforeAll(() => initMongo());
  it("print db", async () => {
    // const trades = await Trade.find({});
    // console.log(Math.max(...trades.map(({ timestamp }) => timestamp)));
  }, 500000);
  it("Normalize chart BTC/USDC", async () => {
    const trades = await Trade.find({});
    let res = trades
      .filter(
        ({ asset0, asset1 }) =>
          [asset0, asset1].includes(TOKENS_BY_SYMBOL.BTC.assetId) &&
          [asset0, asset1].includes(TOKENS_BY_SYMBOL.USDC.assetId)
      )
      .map((trade) => ({
        id: trade.id,
        price:
          trade.asset0 === TOKENS_BY_SYMBOL.BTC.assetId &&
          trade.asset1 === TOKENS_BY_SYMBOL.USDC.assetId
            ? BN.formatUnits(trade.amount1, 6).div(BN.formatUnits(trade.amount0)).toNumber()
            : BN.formatUnits(trade.amount0, 6).div(BN.formatUnits(trade.amount1)).toNumber(),
      }))
      .filter((trade) => trade.price > 30000 || trade.price < 25000);
    console.log(res);
    await Trade.deleteMany({ _id: { $in: res.map(({ id }) => id) } });
  }, 500000);
});
