use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("BCzhuQmCQVPt1WdFyqgssCDaeZBURET85K2ZsDDdnijs");

#[program]
pub mod tokens {
    use super::*;
    pub fn create_token(_ctx: Context<CreateToken>) -> Result<()> {
        msg!("La cuenta token se ah creado");
        Ok(())
    }

    pub fn create_token_account(_ctx: Context<CreateTokenAccount>) -> Result<()> {
        Ok(())
    }
}


// Endpoint Create
#[derive(Accounts)]
pub struct CreateToken<'info > {
    // Cuenta Mint del token
    #[account(init, payer = authority, mint::decimals = 6, mint::authority = authority, mint::token_program = token_program)]
    pub mint: InterfaceAccount<'info, Mint>,
    // Autoridad del token
    #[account(mut)]
    pub authority: Signer<'info >,
    // LLamadas a las primitivas del sistema
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct CreateTokenAccount<'info > {
    #[account(init, payer = payer, associated_token::mint = mint, associated_token::authority = payer, associated_token::token_program = token_program)]
    pub token_account: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info >,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
