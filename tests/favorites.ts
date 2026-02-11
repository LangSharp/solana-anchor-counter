import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import { expect } from "chai";

describe("favorites", () => {
  const provider = anchor.AnchorProvider.env();
  const hack = anchor.web3.Keypair.generate();
  anchor.setProvider(provider);
  const program = anchor.workspace.Favorites as Program<Favorites>;

  it("Inicializa correctamente", async () => {
      const favNumber = 87;
      const favColor: string = "Red";
      const hobbies: string[] = ["Program", "Music"];
      const [favoriteAddress, bump] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("favorites"), provider.wallet.publicKey.toBuffer()],
          program.programId
      )


    await program.methods
      .setFavorites(favNumber, favColor, hobbies)
      .accounts({
        user: provider.wallet.publicKey,
      })
      .rpc();

      const account = await program.account.favorites.fetch(favoriteAddress);
      console.log("Numero del contrato bump: ", bump.toString());
      console.log("Numero Favorito: ", account.number);
      console.log("Color favorito: ", account.color.toString());
      console.log("Hobies: ", account.hobbies.toString());
  });


    it("Invalid Entry for PDA", async () => {
      const [favoriteAddress] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("favorites"), provider.wallet.publicKey.toBuffer()],
          program.programId
      )

    await program.methods
      .setFavorites(85, "Blue", ["Swing", "Football"])
      .accounts({
        user: provider.wallet.publicKey,
        favorite: favoriteAddress,
      })
      .rpc();

    try {
        await program.methods
            .setFavorites(34, "Black", ["Hack", "IA"])
            .accounts({
                user: hack.publicKey,
                favorites: favoriteAddress,
            }).signers([hack])
            .rpc();
        throw new Error("Error de seguridad el estado se modifico")
        } catch (err) {
            console.log("Error bloqueado por proteccion de seed's");
            expect(err.message).to.contains("constraint");
            console.log(err.message);
        }

        const myData = await program.account.favorites.fetch(favoriteAddress)
        expect(myData.number).to.equal(85);
        expect(myData.color).to.not.equal("Black");
      });
});
