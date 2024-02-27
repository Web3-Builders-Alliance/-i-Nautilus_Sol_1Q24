import { 
    walletFromPrivateKey, 
    getConnection,
    requestAirdrop
 } from "./utils";

import wallet from "./wallet.json";

// Retrieve KeyPair from Private Key array
const keypair = walletFromPrivateKey(wallet);
console.log(`Retrieved Wallet KeyPair: ${keypair.publicKey}`);

// Create DevNet Connection
const connection = getConnection('devnet');
console.log(`Connected to: ${connection.rpcEndpoint}`);

// Request DevNet Airdrop SOL tokens
requestAirdrop(keypair, connection).then( tx => {
    if(tx){
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    }else{
        console.log(`Airdrop failed: most likely you have exceeded you daily limit`);
    }
});
