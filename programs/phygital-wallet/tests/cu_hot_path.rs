mod common;

use common::{setup_locked_execute, TestContext};

#[test]
fn reports_hot_path_compute_units() {
    let mut ctx = TestContext::new();
    let amount = 1_000_000u64;
    let (mut passkey, _owner, _recipient, asset, mint, sender, recipient_token) =
        setup_locked_execute(&mut ctx, amount);

    let execute_meta = ctx
        .send_execute_spl_transfer(
            asset,
            mint,
            sender,
            recipient_token,
            amount,
            &mut passkey,
            true,
        )
        .expect("execute");

    let execute_cu = TestContext::program_compute_units(&execute_meta.logs, &ctx.program_id)
        .expect("execute program CU");
    eprintln!(
        "execute: program={execute_cu} tx_total={}",
        execute_meta.compute_units_consumed
    );
    assert!(execute_cu < 28_000, "execute used {execute_cu} CU");
}
