use anchor_lang::prelude::*;


#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Peer {
    pub keyhash: String,
    pub ipaddress: String,
    pub priority: u8
}

#[account]
#[derive(Default)]
pub struct DHT {
    pub peers: Vec<Peer>,
    pub seed: u64,
    pub bump: u8,
}

impl DHT {
    /// Calculate storage size of or fixed struct plus the dynamic size of peers
    pub fn storage_size(_instance: &DHT) -> usize {
        let entry_size = std::mem::size_of::<DHT>();
        let entries_size = _instance.peers.len() * entry_size;
        let fixed_size: usize = std::mem::size_of::<DHT>();
        8 + fixed_size + entries_size
    }
}

impl Peer {
    pub fn storage_size(_instance: &Peer) -> usize {
        let fixed_size: usize = std::mem::size_of::<Peer>();
        8 + fixed_size
    }
}