import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import { Escrow } from "../target/types/escrow";


// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Escrow as Program<Escrow>;
const connection = anchor.getProvider().connection;

// Create Account Keypairs
const maker = Keypair.generate();
const taker = Keypair.generate();
const mintX = Keypair.generate();
const mintY = Keypair.generate();

// escrow seed - 
const escrowseed = new anchor.BN(11111111);
// escrow amount
const escrowamount = new anchor.BN(10 * LAMPORTS_PER_SOL);

// Build ATA accounts
const escrow = PublicKey.findProgramAddressSync(
  [Buffer.from("escrow"), maker.publicKey.toBuffer(), escrowseed.toArrayLike(Buffer, "le", 8),],
  program.programId
)[0];
const vault = getAssociatedTokenAddressSync(
  mintX.publicKey,
  escrow
);
const makerAtaX = getAssociatedTokenAddressSync(
  mintX.publicKey,
  maker.publicKey
);
const makerAtaY = getAssociatedTokenAddressSync(
  mintY.publicKey,
  taker.publicKey
);
//const takerAtaX = getAssociatedTokenAddressSync(
//  mintX.publicKey,
//  taker.publicKey
//);

const confirm = async (signature: string): Promise<string> => {
  const block = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...block,
  });
  return signature;
};

const log = async (signature: string): Promise<string> => {
  console.log(
    `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
  );
  return signature;
};

it("Airdrop", async () => {
  await connection
    .requestAirdrop(maker.publicKey, LAMPORTS_PER_SOL * 10)
    .then(confirm)
    .then(log);
  await connection
    .requestAirdrop(taker.publicKey, LAMPORTS_PER_SOL * 10)
    .then(confirm)
    .then(log);
});



describe("escrow", () => {

  it("initialize escrow for refund flow", async () => {
    // Add your test here.
    await program.methods
      .make(escrowseed, escrowamount)
      .accounts({
        maker: maker.publicKey,
        taker: taker.publicKey,
        mintX: mintX.publicKey,
        mintY: mintY.publicKey,
        escrow,
        vault,
        makerAtaX,
        makerAtaY,
        token_program: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
  });


  it("refund escrow", async () => {
    // Add your test here.
    await program.methods
      .refund()
      .accounts({
        maker: maker.publicKey,
        mintX: mintX.publicKey,
        mintY: mintY.publicKey,
        escrow,
        vault,
        makerAtaX,
        token_program: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
  });


  it("initialize escrow for taker flow", async () => {
    // Add your test here.
    await program.methods
      .make(escrowseed, escrowamount)
      .accounts({
        maker: maker.publicKey,
        taker: taker.publicKey,
        mintX: mintX.publicKey,
        mintY: mintY.publicKey,
        escrow,
        vault,
        makerAtaX,
        makerAtaY,
        token_program: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
    });

  it("taker retrieve escrow", async () => {
    // Add your test here.
    await program.methods
      .take()
      .accounts({
        taker: taker.publicKey,
        maker: maker.publicKey,
        mintX: mintX.publicKey,
        mintY: mintY.publicKey,
        escrow,
        vault,
        makerAtaY,
        token_program: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc()
      .then(confirm)
      .then(log);
  });

});
