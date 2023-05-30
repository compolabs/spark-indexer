extern crate alloc;
use fuel_indexer_macros::indexer;
use fuel_indexer_plugin::types::BlockData;
use fuel_indexer_plugin::utils::first8_bytes_to_u64;
// const PROXY: &str = "0x8924a38ac11879670de1d0898c373beb1e35dca974c4cab8a70819322f6bd9c4";

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod compolabs_index_mod {

    fn handle_block(block: BlockData) {
        let height = block.height;
        let txs = block.transactions.len();
        Logger::info(&format!("🧱 Block height: {height} | transacrions: {txs}",));

        // let proxy_contract_id = ContractId::from_str(PROXY).unwrap();
        // Logger::info(&format!("Proxy = {proxy_contract_id}"));
        let mut results: Vec<OrderData> = vec![];
        for tx in block.transactions.clone() {
            let receipt = tx.receipts.iter().find(|receipt| receipt.data().is_some());
            if receipt.is_some() {
                let data = receipt.unwrap().data().unwrap_or(&[]);
                let data = ProxySendFundsToPredicateParams::try_from(data);
                if data.is_ok() {
                    let data = data.unwrap();
                    let order = OrderData {
                        id: first8_bytes_to_u64(data.predicate_root),
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
                    // Logger::info(&format!("{:#?}", order));
                    results.push(order);
                }
            }
        }
        if results.len() > 0 {
            // println!("⏱ timestamp= {:?}",  Utc::now().timestamp());
            Logger::info(&format!("📬 Orders: {:#?} ", results));
        }
    }

    fn handle_log_data(data: ProxySendFundsToPredicateParams) {
        Logger::info(format!("✨ ProxySendFundsToPredicateParams \n{:?}", data).as_str());
    }

    fn handle_call(call: Call) {
        Logger::info(format!("🤙 Call \n{:?}", call).as_str());
    }

    fn handle_log(log: Log) {
        Logger::info(format!("📝 Log \n{:?}", log).as_str());
    }

    fn handle_transfer(transfer: Transfer) {
        Logger::info(format!("💸 Transfer \n{:?}", transfer).as_str());
    }

    fn handle_transferout(transfer_out: TransferOut) {
        Logger::info(format!("🍃 TransferOut \n{:?}", transfer_out).as_str());
    }

}
