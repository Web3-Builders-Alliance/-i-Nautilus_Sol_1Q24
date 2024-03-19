use anchor_lang::prelude::*;

pub mod constant;
pub mod error;
pub mod instructions;
pub mod states;

pub use instructions::*;
pub use states::*;

declare_id!("DgR8BkZ1KvenUeWvwK2zoi9kiEHfrbepq2dCh5Nmm1pn");

#[program]
pub mod dht {
    use super::*;

    pub fn init_dht(ctx: Context<InitDHT>, seed: u64) -> Result<()> {
        instructions::peers::init(ctx, seed)
    }

    pub fn add_peer(ctx: Context<Auth>, keyhash: String, ipaddress: String, priority: u8) -> Result<()> {
        instructions::peers::add(ctx, keyhash, ipaddress, priority)
    }

    pub fn find_peers(ctx: Context<Auth>, keyhash: String) -> Result<()> {
        instructions::peers::find(ctx, keyhash)
    }


}

