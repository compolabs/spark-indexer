import { schedule } from "node-cron";
import OrdersFetcher from "../services/ordersFetcher";

export const initOrderFetcherCrone = async () => {
  const fetcher = new OrdersFetcher();
  await fetcher.init().then(() => console.log("✅ Order Fetcher initialized"));
  const scheduledJobFunction = schedule("*/5 * * * * *", () =>
    Promise.all([fetcher.updateActiveOrders(), fetcher.fetchNewOrders()])
  );

  scheduledJobFunction.start();

  console.log("✅ Order Fetcher Crone started");
};
