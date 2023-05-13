import { schedule } from "node-cron";
import TradesFetcher from "../services/tradesFetcher";

export const initTradeFetcherCrone = async () => {
  const fetcher = new TradesFetcher();
  await fetcher.init().then(() => console.log("✅ Trades Fetcher initialized"));
  const scheduledJobFunction = schedule("*/30 * * * * *", () =>
    fetcher.sync().catch((e) => console.error(`❌ Trades sync ${e.toString()}`))
  );
  scheduledJobFunction.start();
  console.log("✅ Trades Fetcher Crone started");
};
