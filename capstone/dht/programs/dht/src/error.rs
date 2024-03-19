use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCodes {
    #[msg("You are not authorised to do this.")]
    Unauthorized,
    #[msg("Not allowed")]
    NotAllowed,
    #[msg("Key not found")]
    KeyNotFound
}