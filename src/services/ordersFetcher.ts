import { LimitOrdersAbi, OrderOutput } from "../constants/limitOrdersConstants/LimitOrdersAbi";
import { LimitOrdersAbi__factory } from "../constants/limitOrdersConstants/LimitOrdersAbi__factory";
import { Wallet } from "@fuel-ts/wallet";
import { Provider, sleep } from "fuels";
import { Order, orderOutputToIOrder } from "../models/Order";
import { contractAddress, nodeUrl, privateKey } from "../config";
import BigNumber from "bignumber.js";
import BN from "../utils/BN";

class OrdersFetcher {
  initialized: boolean = false;

  constructor() {}

  private setInitialized = (l: boolean) => (this.initialized = l);
  public init = async () => {
    if (this.initialized) throw new Error("Already initialized");
    if ((await this.getLastOrderFromDb()) == null) await this.fetchAllOrders();
    this.setInitialized(true);
  };

  newOrderFetchIsRunning = false;
  updateActiveOrdersIsRunning = false;

  public fetchNewOrders = async () => {
    const totalOrdersAmount = await this.getOrdersAmount().then((v) => v.toNumber());
    const limitOrdersContract = this.wallet();
    const functions = limitOrdersContract.functions;
    const lastOrderId = await this.getLastOrderFromDb().then((o) => o.id);
    if (lastOrderId === totalOrdersAmount) return;
    if (lastOrderId > totalOrdersAmount) {
      await Order.deleteMany().then(this.fetchAllOrders);
      return;
    }

    const length = new BN(totalOrdersAmount.toString())
      .minus(lastOrderId)
      .div(10)
      .toDecimalPlaces(0, BigNumber.ROUND_CEIL)
      .toNumber();
    if (length === 0) return;
    const chunks = await Promise.all(
      Array.from({ length }, (_, i) =>
        functions!
          .orders(i * 10)
          .get()
          .then((res) => res.value.filter((v) => v != null && v.id.gt(lastOrderId)))
          .then((res) => res.map(orderOutputToIOrder))
      )
    );
    await Order.insertMany(chunks.flat().reverse());
  };

  wallet = () => {
    const provider = new Provider(nodeUrl);
    const wallet = Wallet.fromPrivateKey(privateKey, provider);
    return LimitOrdersAbi__factory.connect(contractAddress, wallet);
  };

  public updateActiveOrders = async () => {
    if (this.updateActiveOrdersIsRunning) {
      console.log("🍃 update Active Orders Is Running skip");
      return;
    }
    this.updateActiveOrdersIsRunning = true;
    const limitOrdersContract = this.wallet();
    const functions = limitOrdersContract.functions;
    const activeOrders = await Order.find({ status: "Active" });
    const chunks = sliceIntoChunks(activeOrders, 10).map((chunk) =>
      chunk.map((o) => o.id.toString()).concat(Array(10 - chunk.length).fill("0"))
    );
    console.log("chunks length:", chunks.length);
    const results: Array<Array<OrderOutput>> = [];

    const batches = [];
    const chunkSize = 10;
    for (let i = 0; i < chunks.length; i += chunkSize) {
      const batch = chunks.slice(i, i + chunkSize);
      batches.push(batch);
    }
    await batches.reduce(async (promise, batch, index) => {
      await promise;
      await sleep(5000);
      await Promise.all(
        batch.map((chunk, indexb) => {
          console.log("--->>> batch:", index, "chunk:", indexb);
          return functions
            .orders_by_id(chunk as any)
            .get()
            .then((res) => results.push(res.value))
            .catch((err) => {
              console.log(JSON.stringify(chunk, null, " "));
              console.log(err);
            });
        })
      );
    }, Promise.resolve());

    //
    // for (let batch in batchs) {
    //
    //   // counter++;
    //   // if (counter > 5) {
    //   //   counter = 0;
    //   //   batch++;
    //   // }
    //   const chunk = chunks[i];
    //   // sleep(batch * 1000).then(() => {
    //   console.log(i, "/", chunks.length);
    //   const res = results.push(res);
    //   // });
    //
    //   // results.push(result);
    //   // .catch(console.error)
    // }
    // const results: Array<any> = [];
    // let counter = 0;
    // let batch = 0;
    // await chunks.reduce(async (promise, chunk, index) => {
    //   await promise;
    //   counter++;
    //   if (counter > 5) {
    //     counter = 0;
    //     batch++;
    //   }
    //   await sleep(batch * 200);
    //   console.log("-->>>>", index);
    //   functions
    //     .orders_by_id(chunk as any)
    //     .get()
    //     .then((res) => results.push(res.value));
    //   // .catch(console.error)
    // }, Promise.resolve());
    const flat = results.flat();

    await Promise.all(
      flat.map((orderOutput) => {
        if (orderOutput != null) {
          const order = orderOutputToIOrder(orderOutput);
          return Order.updateOne({ id: order.id }, order);
        }
      })
    );
    console.log("🏁 finish");
  };

  private fetchAllOrders = async () => {
    const ordersAmount = await this.getOrdersAmount();
    const limitOrdersContract = this.wallet();
    if (limitOrdersContract === null) return;
    const functions = limitOrdersContract.functions;
    const length = new BN(ordersAmount.toString())
      .div(10)
      .toDecimalPlaces(0, BigNumber.ROUND_CEIL)
      .toNumber();
    const chunks = await Promise.all(
      Array.from({ length }, (_, i) =>
        functions
          .orders(i * 10)
          .get()
          .then((res) => res.value.filter((v) => v != null))
      )
    );

    await Order.insertMany(chunks.flat().map(orderOutputToIOrder).flat().reverse());
  };

  private getOrdersAmount = () =>
    this.wallet()
      .functions.orders_amount()
      .simulate()
      .then((res) => res.value)
      .catch((e) => {
        throw new Error(`❌ Cannot get orders amount\n ${e}`);
      });

  private getLastOrderFromDb = () =>
    Order.find()
      .sort({ id: -1 })
      .limit(1)
      .then((arr) => arr[0]);
}

function sliceIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export default OrdersFetcher;
