use anchor_lang::prelude::*;

declare_id!("9SqEGi3GLWjzF4aUtqyDZFS1tkobHBh6jkHM2DCxUkXq");

#[program]
pub mod amm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
