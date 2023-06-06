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
            match tx.status {
                fuel::TransactionStatus::Failure { .. } => continue,
                _ => (),
            }

            tx.receipts.iter().for_each(|receipt| {
                if receipt.data().is_some() {
                    let data = ProxySendFundsToPredicateParams::try_from(receipt.data().unwrap());
                    let id = receipt.id();
                    if data.is_ok() && id.is_some() && id.unwrap().to_owned() == proxy_contract_id {
                        Logger::info(&format!("📬 Order: {:#?} ", data));
                    }
                }
            });
        }
    }

    fn handle_log_data(data: ProxySendFundsToPredicateParams) {
        Logger::info(format!("✨ ProxySendFundsToPredicateParams \n{:?}", data).as_str());
    }
}

#[allow(unused)]
fn timestamp_by_status(status: fuel::TransactionStatus) -> u64 {
    match status {
        fuel::TransactionStatus::Success { time, .. } => time,
        _ => 0,
    }
}
