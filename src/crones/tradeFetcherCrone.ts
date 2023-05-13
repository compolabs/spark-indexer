import { schedule } from "node-cron";
import TradesFetcher from "../services/tradesFetcher";

export const initTradeFetcherCrone = async () => {
  let isRunning = false;
  const fetcher = new TradesFetcher();
  await fetcher.init().then(() => console.log("✅ Trades Fetcher initialized"));
  // const scheduledJobFunction = schedule("*/30 * * * * *", () =>
  //   fetcher.sync().catch((e) => console.error(`❌ Trades sync ${e.toString()}`))
  // );
  const scheduledJobFunction = schedule("*/30 * * * * *", () =>
    !isRunning
      ? new Promise((r) => r(""))
          .then(() => console.log(`🏎 Trades sync start`))
          .then(() => (isRunning = true))
          .then(fetcher.sync)
          .catch((e) => console.error(`❌ Trades sync error \n`, e))
          .finally(() => {
            console.log(`🏁 Trades sync finish`);
            isRunning = false;
          })
      : console.log(`🍃 Trades sync already running, skip`)
  );
  scheduledJobFunction.start();
  console.log("✅ Trades Fetcher Crone started");
};
