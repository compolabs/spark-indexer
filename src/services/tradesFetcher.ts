import { LimitOrdersAbi } from "../constants/limitOrdersConstants/LimitOrdersAbi";
import { LimitOrdersAbi__factory } from "../constants/limitOrdersConstants/LimitOrdersAbi__factory";
import { Wallet } from "@fuel-ts/wallet";
import { Provider } from "fuels";
import { contractAddress, nodeUrl, privateKey } from "../config";
import { ITrade, Trade, tradeOutputToITrade } from "../models/Trade";

class TradesFetcher {
  limitOrdersContract: LimitOrdersAbi;
  initialized: boolean = false;

  constructor() {
    const provider = new Provider(nodeUrl);
    const wallet = Wallet.fromPrivateKey(privateKey, provider);
    this.limitOrdersContract = LimitOrdersAbi__factory.connect(contractAddress, wallet);
  }

  private setInitialized = (l: boolean) => (this.initialized = l);
  public init = async () => {
    if (this.initialized) throw new Error("Already initialized");
    const lastTrade = await Trade.find().sort("-timestamp").limit(1);
    await this.fetchTrades(lastTrade.length === 1 ? lastTrade[0].timestamp : 0);
    this.setInitialized(true);
  };

  public sync = async () => {
    const lastTrade = await Trade.find().sort("-timestamp").limit(1);
    await this.fetchTrades(lastTrade.length === 1 ? lastTrade[0].timestamp : 0);
  };

  private fetchTrades = async (timestamp = 0) => {
    // console.log(timestamp);
    if (this.limitOrdersContract === null) return;
    const functions = this.limitOrdersContract.functions;
    let offset = 0;
    let trades: ITrade[] = [];
    while (true) {
      const batch: Array<ITrade> = await functions
        .trades(offset)
        .get()
        .then(({ value }) => value.map((t) => (t != null ? tradeOutputToITrade(t) : null)))
        .then((batch) => batch.filter((t) => t != null && t.timestamp > timestamp) as ITrade[]);
      trades = [...trades, ...batch];
      // console.log({ timestamp: batch[batch.length - 1]?.timestamp, len: trades.length, offset });
      offset++;
      if (batch.length == 0) break;
    }
    await Trade.insertMany(trades.reverse());
  };
}

export default TradesFetcher;
