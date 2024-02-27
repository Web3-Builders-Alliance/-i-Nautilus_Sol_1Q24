import { Connection, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token"

import wallet from "./wallet/wba-wallet.json"

//Connect our WBA Wallet
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection to devnet SOL tokens
const connection = new Connection("https://api.devnet.solana.com", {commitment: "confirmed"});

(async () => {
  
  // Create new token mint
  const mint = await createMint(
    connection,
    keypair,
    keypair.publicKey,
    keypair.publicKey,
    6
 );

 console.log(`The unique identifier of the token is: ${mint.toBase58()}`); 

 // AG14JQYn5QRX4UqvUro1qENUivmoW9P2Z6a9h9obiaXj

})();