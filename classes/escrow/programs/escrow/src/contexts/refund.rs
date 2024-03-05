use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::states::Escrow;

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    pub mint_x: InterfaceAccount<'info, Mint>,

    pub mint_y: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = mint_x,
        has_one = mint_y,
        close = maker,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        associated_token::mint = escrow.mint_x,
        associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint_x,
        associated_token::authority = maker,
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    
    pub system_program: Program<'info, System>,
}

 impl<'info> Refund<'info> {
    
    // Return Funds to Maker and close escrow
    pub fn refund(&mut self) -> Result<()> {
    
        // Create signer seeds
        let maker = self.maker.to_account_info().key();
        let seed_bytes = self.escrow.seed.to_le_bytes();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            maker.as_ref(),
            seed_bytes.as_ref(),
            &[self.escrow.bump],
        ]];

        // Create CPI Call to return escrow funds to maker
        let cpi_ctx_refund = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            TransferChecked {
                from: self.vault.to_account_info(),
                to: self.maker_ata_x.to_account_info(),
                authority: self.escrow.to_account_info(),
                mint: self.mint_x.to_account_info(),
            },
            signer_seeds
        );

        transfer_checked(cpi_ctx_refund, self.vault.amount, self.mint_x.decimals)?;


        // Create CPI Call to close escrow ata account and send rent back to maker
        let cpi_ctx_close = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.vault.to_account_info(),
                destination: self.maker.to_account_info(),
                authority: self.escrow.to_account_info(),
            },
            signer_seeds
        );

        close_account(cpi_ctx_close)
    }

}