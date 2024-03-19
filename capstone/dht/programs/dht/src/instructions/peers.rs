use anchor_lang::prelude::*;

use crate::states::{
    DHT,
    Peer
};
use crate::error::ErrorCodes;

/**
 * Initialise a DHT with a seed.
 */
pub fn init(ctx: Context<InitDHT>, seed: u64) -> Result<()> {
    let dht = &mut ctx.accounts.dht;
    dht.peers = vec![];
    dht.seed = seed;
    dht.bump = ctx.bumps.dht;
    Ok(())
}

/**
 * Add A source peer ip address for music file
 */
pub fn add(ctx: Context<Auth>, keyhash: String, ipaddress: String, priority: u8) -> Result<()> {
    let dht = &mut ctx.accounts.dht;
    let peer = Peer { keyhash, ipaddress, priority };
    dht.peers.push(peer);
    Ok(())
}

/**
 * Find Peers based on music file hash key
 */
pub fn find(ctx: Context<Auth>, keyhash: String) -> Result<()> {
    let dht = &ctx.accounts.dht;
    let peer = dht.peers.iter().find(|p| p.keyhash == keyhash);
    match peer {
        Some(p) => {
            msg!("Peer - Hash: {}, IP: {}", p.keyhash, p.ipaddress);
            // TODO - return array sorted by priority descending
        }
        None => {
            msg!("Error: {}", ErrorCodes::KeyNotFound);
        }
    }
    Ok(())
}


#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct InitDHT<'info> {

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init, 
        payer = user, 
        space = DHT::storage_size(&DHT::default()),
        seeds = [b"dht", user.key().as_ref(), seed.to_le_bytes().as_ref()], 
        bump
    )]
    pub dht: Account<'info, DHT>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Auth<'info> {

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"dht", user.key().as_ref(), dht.seed.to_le_bytes().as_ref()], 
        bump = dht.bump
    )]
    pub dht: Account<'info, DHT>,

    pub system_program: Program<'info, System>,
}