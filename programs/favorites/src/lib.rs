use anchor_lang::prelude::*;

declare_id!("Hfa66TSGWs6qZhKViRvq4wLqkFihFXBLcpK6C47SE9En");

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(ctx: Context<SetFavorites>, number: u8, color: String, hobbies: Vec<String>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        let user_public_key = ctx.accounts.user.key();
        msg!("User public key {}, hobbies: {:?} favorite color is: {} and favorite number is: {}",
             user_public_key, &hobbies, &color, &number);
        ctx.accounts.favorites.set_inner(Favorites { number, color, hobbies });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init_if_needed, payer = user, space = Favorites::INIT_SPACE + 8, seeds = [b"favorites", user.key().as_ref()], bump)]
    pub favorites: Account<'info, Favorites>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u8,
    #[max_len(50)]
    pub color: String,
    #[max_len(5,50)]
    pub hobbies: Vec<String>,
}
