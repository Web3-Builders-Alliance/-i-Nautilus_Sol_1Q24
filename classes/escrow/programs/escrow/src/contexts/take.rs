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
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    pub maker: SystemAccount<'info>,

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
        mut,
        associated_token::mint = mint_y,
        associated_token::authority = taker,
    )]
    pub maker_ata_y: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    
    pub system_program: Program<'info, System>,
}

 impl<'info> Take<'info> {
    
    // Retrieve Funds to Taker and close escrow
    pub fn take(&mut self) -> Result<()> {
    
        // Create signer seeds
        let maker = self.maker.to_account_info().key();
        let seed_bytes = self.escrow.seed.to_le_bytes();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            maker.as_ref(),
            seed_bytes.as_ref(),
            &[self.escrow.bump],
        ]];

        // Create CPI Call to sned escrow funds to taker
        let cpi_ctx_refund = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            TransferChecked {
                from: self.vault.to_account_info(),
                to: self.maker_ata_y.to_account_info(),
                authority: self.escrow.to_account_info(),
                mint: self.mint_y.to_account_info(),
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