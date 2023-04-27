import { initMongo } from "../src/services/mongoService";
import { Order } from "../src/models/Order";

describe("items", () => {
  beforeAll(() => initMongo());

  it("test", async () => {
    // console.log(await Order.count());
    // console.log(await Order.count());
    console.log(await Order.find({ id: 1 }));
  });
  it("print db", async () => {
    const orders = await Order.find({});
    // console.dir(orders, { maxArrayLength: null });
    console.dir(
      orders.filter((o) => o.id > 100).map((o) => o.id),
      { maxArrayLength: null }
    );
  }, 500000);
  it("drop db", async () => {
    // await Order.deleteMany();
  }, 500000);
});
