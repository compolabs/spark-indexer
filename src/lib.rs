extern crate alloc;
use fuel_indexer_utils::prelude::*;

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod compolabs_index_mod {

    fn handle_order_slot(data: ProxySendFundsToPredicateParams) {
        //TODO validate the proxy contract
        // const PROXY: &str = "0x8924a38ac11879670de1d0898c373beb1e35dca974c4cab8a70819322f6bd9c4";
        info!("Order slot {:#?}", data);

        let order = OrderData {

            // https://docs.rs/fuel-indexer-utils/0.18.5/fuel_indexer_utils/prelude/fn.id8.html
            id: id8(data.predicate_root),
            predicate_root: data.predicate_root,
            asset0: data.asset_0,
            asset1: data.asset_1,
            maker: data.maker,
            min_fulfill_amount0: data.min_fulfill_amount_0,
            price: data.price,
            asset0_decimals: data.asset_0_decimals.into(),
            asset1_decimals: data.asset_1_decimals.into(),
            price_decimals: data.price_decimals.into(),
        };
        order.save();
    }
}
