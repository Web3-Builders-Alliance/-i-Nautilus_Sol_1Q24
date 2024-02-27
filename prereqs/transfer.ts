import { PublicKey } from "@solana/web3.js";
import { 
    walletFromPrivateKey,
    getConnection, 
    solToLamports,
    lamportsToSol,
    transferFunds
 } from "./utils";

import wallet from "./wallet.json";


// Destination recipient wallet
const to = new PublicKey('B1e7JpgwMgNZU6BhUF4xCCzDwW7jfYs63odu32A8L2cA');

// Retrieve KeyPair from Private Key array
const keypair = walletFromPrivateKey(wallet);
console.log(`Retrieved Wallet KeyPair: ${keypair.publicKey}`);

// Create DevNet Connection
const connection = getConnection('devnet');
console.log(`Connected to: ${connection.rpcEndpoint}`);


// execute transfers
(async () => {

    // Get Current Balance
    let balance = await connection.getBalance(keypair.publicKey);
    console.log(`Balance is: ${ lamportsToSol(balance) }`);

    // Send initial 0.1 SOL
    let first_tx = await transferFunds(connection, keypair, to, solToLamports(0.1));

    // Get Current Balance
    balance = await connection.getBalance(keypair.publicKey);
    console.log(`Balance now: ${ lamportsToSol(balance) }`);

    // Send initial 0.1 SOL
    let second_tx = await transferFunds(connection, keypair, to, balance);

    // Get Current Balance
    balance = await connection.getBalance(keypair.publicKey);
    console.log(`Balance now: ${ lamportsToSol(balance) }`);

})();
