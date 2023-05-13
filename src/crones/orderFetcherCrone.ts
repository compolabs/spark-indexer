import { schedule } from "node-cron";
import OrdersFetcher from "../services/ordersFetcher";

export const initOrderFetcherCrone = async () => {
  let isUpdateActiveOrdersRunning = false;
  let isFetchNewOrdersRunning = false;
  const fetcher = new OrdersFetcher();
  await fetcher.init().then(() => console.log("✅ Order Fetcher initialized"));
  const scheduledJobFunction = schedule("*/5 * * * * *", () =>
    Promise.all([
      !isUpdateActiveOrdersRunning
        ? new Promise((r) => r(""))
            .then(() => console.log(`🏎 Update active orders start`))
            .then(() => (isUpdateActiveOrdersRunning = true))
            .then(fetcher.updateActiveOrders)
            .catch((e) => console.error(`❌ Update active orders error \n`, e))
            .finally(() => {
              console.log(`🏁 Update active orders finish`);
              isUpdateActiveOrdersRunning = false;
            })
        : console.log(`🍃 Update active orders already running, skip`),
      !isFetchNewOrdersRunning
        ? new Promise((r) => r(""))
            .then(() => console.log(`🏎 Fetch new orders start`))
            .then(() => (isFetchNewOrdersRunning = true))
            .then(fetcher.fetchNewOrders)
            .catch((e) => console.error(`❌ Fetch new orders error \n`, e))
            .finally(() => {
              console.log(`🏁 Fetch new orders finish`);
              isFetchNewOrdersRunning = false;
            })
        : console.log(`🍃 Fetch new orders already running, skip`),
    ])
  );

  scheduledJobFunction.start();

  console.log("✅ Order Fetcher Crone started");
};
