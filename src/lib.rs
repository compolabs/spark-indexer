extern crate alloc;
use fuel_indexer_macros::indexer;
use fuel_indexer_plugin::types::BlockData;
use fuel_indexer_plugin::utils::first8_bytes_to_u64;

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

            if tx.transaction.is_script() {
                let script = tx.clone().transaction.as_script().unwrap().clone();

                let inputs = script.inputs();
                let outputs = script.outputs();
                let asset0_predicate_input = inputs.iter().find(|i| i.is_coin_predicate());
                let asset1_output = outputs.get(0);
                if asset0_predicate_input.is_none() || asset1_output.is_none() {
                    // Logger::info(&format!("🍃 Wrong inputs/otputs, skipping",));
                    continue;
                }
                let coin_predicate_input = asset0_predicate_input.unwrap();
                let asset1_output = asset1_output.unwrap();

                // TODO
                // let asset0_change_output = outputs.iter().find(|o| {
                //     o.is_coin()
                //         && o.asset_id().is_some()
                //         && o.to().is_some()
                //         && o.asset_id().unwrap() == asset0.unwrap()
                //         && o.to().unwrap() == predicate_root.unwrap()
                // });
                let amount0 = 0; //input0.amount().unwrap_or(0) - output3.amount().unwrap_or(0); //TODO
                let amount1 = 0; //input1.amount().unwrap_or(0) - output1.amount().unwrap_or(0); //TODO

                let predicate_root = coin_predicate_input.input_owner();
                let asset0 = coin_predicate_input.asset_id();
                let asset1 = asset1_output.asset_id();
                let timestamp = timestamp_by_status(tx.status);
                if asset0.is_none() || asset1.is_none() || predicate_root.is_none() {
                    // Logger::info(&format!("🍃 Wrong asset0/asset1/predicate_root, skipping",));
                    continue;
                }

                let trade = TradeData {
                    predicate_root: *predicate_root.unwrap(),
                    asset0: ContractId::new(**asset0.unwrap()),
                    asset1: ContractId::new(**asset1.unwrap()),
                    amount0,
                    amount1,
                    timestamp,
                };
                trade.save();
                Logger::info(&format!("🐲 Trade {trade:#?}"));
            }
        }
        Logger::info(&format!("🏁 Block {height} habdler finished"));
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

fn timestamp_by_status(status: ClientTransactionStatusData) -> u64 {
    if let ClientTransactionStatusData::Success { time, block_id: _ } = status {
        time.timestamp().try_into().unwrap_or(0)
    } else {
        0
    }
}
