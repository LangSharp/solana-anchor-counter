import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Tokens } from "../target/types/tokens";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { assert } from "chai";

describe("tokens", () => {
  // Configurar el provider para conectar con el validador local
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tokens as Program<Tokens>;

  // Generamos un nuevo Keypair para el Mint cada vez que corremos el test
  const mintKeypair = Keypair.generate();
  const authority = provider.wallet.publicKey;

  it("¡Crea un nuevo Mint con Interfaces!", async () => {
    try {
      const tx = await program.methods
        .createToken()
        .accounts({
          mint: mintKeypair.publicKey,
          authority: authority,
          // Nota: systemProgram y tokenProgram los resuelve Anchor automáticamente
          // si los nombres coinciden en el contrato, pero los ponemos para claridad:
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([mintKeypair]) // El mint necesita firmar porque se está creando la cuenta
        .rpc();

      console.log("Transacción de Mint exitosa:", tx);

      // Verificación: Intentamos obtener la cuenta para ver si existe
      const mintAccount = await provider.connection.getAccountInfo(mintKeypair.publicKey);
      assert.ok(mintAccount !== null, "La cuenta Mint debería existir");
    } catch (err) {
      console.error("Error creando el Mint:", err);
      throw err;
    }
  });

  it("¡Crea una Associated Token Account (ATA)!", async () => {
    // 1. Derivamos la dirección de la ATA determinísticamente
    const ata = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      authority,
      false, // allowOwnerOffCurve
      TOKEN_PROGRAM_ID
    );

    try {
      const tx = await program.methods
        .createTokenAccount()
        .accounts({
          mint: mintKeypair.publicKey,
          tokenAccount: ata,
          payer: authority,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Transacción de ATA exitosa:", tx);
      console.log("Dirección de la ATA:", ata.toBase58());

      // Verificación
      const ataAccount = await provider.connection.getAccountInfo(ata);
      assert.ok(ataAccount !== null, "La cuenta ATA debería existir");
    } catch (err) {
      console.error("Error creando la ATA:", err);
      throw err;
    }
  });
});
