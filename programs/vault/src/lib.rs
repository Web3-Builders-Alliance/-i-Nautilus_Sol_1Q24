use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("6WDEMEzLc4Cta1HEB7fBWvQ53fTASTZnXFVC8bQyvWGL");

#[program]
pub mod vault {
    use super::*;

    /**
     * Init State vars
     */
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vault_state.maker = ctx.accounts.maker.key();
        ctx.accounts.vault_state.taker = ctx.accounts.taker.key();
        ctx.accounts.vault_state.state_bump = ctx.bumps.vault_state;
        ctx.accounts.vault_state.vault_bump = ctx.bumps.vault;

        Ok(())
    }

    /**
     * Deposit funds into vault
     */
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // Build CPI Context
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(), 
            Transfer {
                from: ctx.accounts.maker.to_account_info(),
                to: ctx.accounts.vault.to_account_info()
            }
        );
        // Transfer deposit amount
        transfer(cpi_ctx, amount)
    }

    /**
     * Cancel Vault Account - return funds in vault back to maker
     */
    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        // Create longer lived binding vars for signer seeds
        let maker = ctx.accounts.maker.key();
        let vault_bump = ctx.accounts.vault_state.vault_bump;

        // Create Signer seeds to sign transfer
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault", 
            maker.as_ref(), 
            &[vault_bump]
        ]];

        // Build CPI Context
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.maker.to_account_info()
            },
            signer_seeds
        );
        // Transfer funds out of vault back to maker
        transfer(cpi_ctx, ctx.accounts.vault.lamports())
    }

    /**
     * Withdraw all funds from vault back to taker
     */
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        // Create longer lived binding vars for signer seeds
        let maker = ctx.accounts.maker.key();
        let vault_bump = ctx.accounts.vault_state.vault_bump;

        // Create Signer seeds to sign transfer
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault", 
            maker.as_ref(), 
            &[vault_bump]
        ]];
        
        // Build CPI Context
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.taker.to_account_info()
            },
            signer_seeds
        );

        // Transfer funds from vault back to maker
        transfer(cpi_ctx, ctx.accounts.vault.lamports())
    }


}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        init,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump,
        payer = maker,
        space = VaultState::INIT_SPACE
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub taker: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        mut,
        has_one = maker,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub maker: SystemAccount<'info>,

    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct VaultState {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub state_bump: u8,
    pub vault_bump: u8,
}

impl Space for VaultState {
    const INIT_SPACE:usize  = 8 + 32 + 32 + 1 +1;
}