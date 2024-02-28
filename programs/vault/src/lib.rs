use anchor_lang::prelude::*;

declare_id!("6WDEMEzLc4Cta1HEB7fBWvQ53fTASTZnXFVC8bQyvWGL");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
