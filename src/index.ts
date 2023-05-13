import mongoose from "mongoose";
import { mongoUrl } from "./config";
import { initOrderFetcherCrone } from "./crones/orderFetcherCrone";
import { initTradeFetcherCrone } from "./crones/tradeFetcherCrone";

// Connect to MongoDB
// mongoose.Promise = bluebird;
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err) => {
    console.log(`❌  MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
  });

// initOrderFetcherCrone();
// initTradeFetcherCrone();
