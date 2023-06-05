extern crate alloc;
use fuel_indexer_utils::prelude::*;

const PROXY: &str = "0x8924a38ac11879670de1d0898c373beb1e35dca974c4cab8a70819322f6bd9c4";
#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod compolabs_index_mod {

    fn handle_block(block: BlockData) {
        let height = block.height;
        let txs = block.transactions.len();
        let proxy_contract_id = ContractId::from_str(PROXY).unwrap();

        Logger::info(&format!("🧱 Block height: {height} | transacrions: {txs}"));

        for tx in block.transactions.clone() {
            let receipt = tx.receipts.iter().find(|receipt| receipt.data().is_some());
            if receipt.is_some() {
                let receipt = receipt.unwrap();
                let data = ProxySendFundsToPredicateParams::try_from(receipt.data().unwrap_or(&[]));
                let id = receipt.id();
                if data.is_ok() && id.is_some() && id.unwrap().to_owned() == proxy_contract_id {
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
                    Logger::info(&format!("📬 Order: {:#?} ", order));
                }
            }
            // Logger::info(&format!("📬 Order handler finished for block {}", tx.id));

            match tx.transaction {
                #[allow(unused)]
                fuel::Transaction::Script(fuel::Script {
                    gas_limit,
                    gas_price,
                    maturity,
                    script,
                    script_data,
                    receipts_root,
                    inputs,
                    outputs,
                    witnesses,
                    metadata,
                }) => {
                    let trade = TradeData {
                        predicate_root: Address::default(),
                        asset0: ContractId::default(),
                        asset1: ContractId::default(),
                        amount0: 0,
                        amount1: 0,
                        timestamp: timestamp_by_status(tx.status),
                    };
                    trade.save();
                    Logger::info(&format!("🐲 Trade {trade:#?}"));
                }
                _ => {
                    Logger::info("Ignoring this transaction type.");
                }
            }

            Logger::info(&format!("🏁 Block {height} handler finished"));
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

fn timestamp_by_status(status: fuel::TransactionStatus) -> u64 {
    match status {
        fuel::TransactionStatus::Success { time, .. } => time,
        _ => 0,
    }
}
