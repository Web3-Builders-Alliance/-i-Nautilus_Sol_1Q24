import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { Week1, IDL } from "./programs/week1";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import wallet from "./wallet/wba-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "finalized"});

// Create our program
const program = new Program<Week1>(IDL, "ctf1VWeMtgxa24zZevsXqDg6xvcMVy4FbP3cxLCpGha" as Address, provider);

// Use the PDA for our CTF-Week1 profile
const profilePda = PublicKey.findProgramAddressSync([Buffer.from("profile"), keypair.publicKey.toBuffer()], program.programId)[0];

// Paste here the mint address for challenge1 token
const mint = new PublicKey("DTsWBnzLxoQPG3qkhx9HP85NPJNGgaJeJMtkqoafmH7W");

// Create the PDA for the Challenge1 Vault
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault1"), keypair.publicKey.toBuffer(), mint.toBuffer()], program.programId)[0];

(async () => {
    try {

        // NB if you get TokenAccountNotFoundError, wait a few seconds and try again!

        // Create the ATA for your Wallet
        const ownerAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        )

        // Mint some tokens! - 2 whole tokens with 14 decimal places
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            ownerAta.address, 
            keypair,
            2e14
        )
        
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);

        // https://explorer.solana.com/tx/62YRP76bwvp8QQo5JDKMdYJAV7shKL94E8QyiJNEwCUMwXvNhLQT6ZTdYaFy7p5A7MU3YDEu6nAebF9xQUxQXvyg?cluster=devnet

        // Sending 1 decimal token to vault
        console.log(`Send 1 decimal (14th) of a token to this vault: 
        https://explorer.solana.com/address/${vault.toBase58()}?cluster=devnet`);
        
        // https://explorer.solana.com/address/FEoBofUkEiX2N8r2J3XF52RTLr82onM5nebth7bBTGbY?cluster=devnet
        
        // Complete the Challenge!
        const completeTx = await program.methods
        .completeChallenge1(new BN(1))
        .accounts({
            owner: keypair.publicKey,
            ata: ownerAta.address,
            profile: profilePda,
            vault: vault,
            mint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        .signers([
            keypair
        ]).rpc();

        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${completeTx}?cluster=devnet`);

        // https://explorer.solana.com/tx/5wuHkp7Ymc8n9hrvMDyMPJy3MpoER1rjDsa3B7pdxkK6Rx5ZntQmS5nLSWVcMYxhs4kCRpfXc2LVWXh9Zm9ibt9h?cluster=devnet

    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();