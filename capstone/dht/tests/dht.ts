import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dht } from "../target/types/dht";
/*
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
*/
import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";


// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Dht as Program<Dht>;
const connection = anchor.getProvider().connection;

// Create Account Keypairs
const auth = Keypair.generate();

// Create seed for DHT
const dhtseed = new anchor.BN(11111111);

// dummy data for file hash and ip address
const keyhash = '123456';
const ipaddress = '127.0.0.1';
const priority = 1;

// Create Auth Account
const dht = PublicKey.findProgramAddressSync(
  [
    Buffer.from("dht"), 
    auth.publicKey.toBuffer(),
    dhtseed.toArrayLike(Buffer, "le", 8)
  ],
  program.programId
)[0];


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
    .requestAirdrop(auth.publicKey, LAMPORTS_PER_SOL * 10)
    .then(confirm)
    .then(log);
});


describe("dht", () => {

  // Initialise DHT Struct Account
  it("Is initialized!", async () => {

    const tx1 = await program.methods
      .initDht(dhtseed)
      .accounts({
        dht,
        user:auth.publicKey
      })
      .signers([auth])
      .rpc({skipPreflight:false})
      .then(confirm)
      .then(log);

      console.log(tx1);
    
  });

  // Add Peer to DHT Account
  it("Add Peer!", async () => {

    const tx2 = await program.methods
    .addPeer(keyhash, ipaddress, priority)
    .accounts({
      dht,
      user:auth.publicKey
    })
    .signers([auth])
    .rpc({skipPreflight:false})
    .then(confirm)
    .then(log);

    console.log(tx2);

  });

  // Find Peers to DHT Account
  it("Find Peers!", async () => {

    const tx3 = await program.methods
    .findPeers(keyhash)
    .accounts({
      dht,
      user:auth.publicKey
    })
    .signers([auth])
    .rpc({skipPreflight:false})
    .then(confirm)
    .then(log);

    console.log(tx3);

  });
  

});
