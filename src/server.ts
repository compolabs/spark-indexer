import { app } from "./app";
import { port } from "./config";
import { initOrderFetcherCrone } from "./crones/orderFetcherCrone";
import { initMongo } from "./services/mongoService";
import { initTradeFetcherCrone } from "./crones/tradeFetcherCrone";

initMongo()
  .then(() => Promise.all([initOrderFetcherCrone(), initTradeFetcherCrone()]))
  .then(() =>
    app.listen(port ?? 5000, () => console.log(`🚀 Server ready at: http://localhost:${port}`))
  );
