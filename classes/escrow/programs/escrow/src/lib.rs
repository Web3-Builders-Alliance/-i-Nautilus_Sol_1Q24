use anchor_lang::prelude::*;

pub mod states;
pub mod contexts;
pub use contexts::*;

declare_id!("3uWejTokqj2HADQUUXUdEkehG3RW3SsD1djtowiuwJn4");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, amount: u64) -> Result<()> {
        ctx.accounts.make(seed, amount, &ctx.bumps)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund()
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.take()
    }
}
