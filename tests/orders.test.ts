import { initMongo } from "../src/services/mongoService";
import { Order } from "../src/models/Order";
import { Provider } from "fuels";
import { contractAddress, nodeUrl, privateKey } from "../src/config";
import { Wallet } from "@fuel-ts/wallet";
import { LimitOrdersAbi__factory } from "../src/constants/limitOrdersConstants/LimitOrdersAbi__factory";

describe("items", () => {
  beforeAll(() => initMongo());

  it("test", async () => {
    const provider = new Provider(nodeUrl);
    const wallet = Wallet.fromPrivateKey(privateKey, provider);
    const limitOrdersContract = LimitOrdersAbi__factory.connect(contractAddress, wallet);
    const functions = limitOrdersContract.functions;

    let ids = [10237, 10239, 10243, 10255, 10277, 10281, 10282, 10284, 10289, 10307];
    const result = await functions
      .orders_by_id(ids as any)
      .get()
      .then((res) => res.value)
      .catch((err) => {
        console.log(JSON.stringify(ids, null, " "));
        console.log(err);
      });
  });
});
