extern crate alloc;
use fuel_indexer_macros::indexer;

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod compolabs_index_mod {

    fn compolabs_handler(params: ProxySendFundsToPredicateParams) {
        Logger::info("Processing a block. (>'.')>");
        let p = Params {
            id: 1,
            predicate_root: params.predicate_root,
            asset0: params.asset_0,
            asset1: params.asset_1,
            maker: params.maker,
            min_fulfill_amount0: params.min_fulfill_amount_0,
            price: params.price,
            asset0_decimals: params.asset_0_decimals.into(),
            asset1_decimals: params.asset_1_decimals.into(),
            price_decimals: params.price_decimals.into(),
        };
        // Logger::info("params = {p}");
        p.save();
    }
}
