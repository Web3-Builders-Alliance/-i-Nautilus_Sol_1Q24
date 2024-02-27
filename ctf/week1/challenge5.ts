import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { Week1, IDL } from "./programs/week1";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import wallet from "./wallet/wba-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});

// Create our program
const program = new Program<Week1>(IDL, "ctf1VWeMtgxa24zZevsXqDg6xvcMVy4FbP3cxLCpGha" as Address, provider);

// Use the PDA for our CTF-Week1 profile
const profilePda = PublicKey.findProgramAddressSync([Buffer.from("profile"), keypair.publicKey.toBuffer()], program.programId)[0];

// Use the PDA for the Auth account
const authPda = PublicKey.findProgramAddressSync([Buffer.from("auth")], program.programId)[0];

// Paste here the mint address for challenge1 token
const mint = new PublicKey("DEeAAAQSpGtvAHbSw1V4hChxAmFZNiwoLP37rU7dM5XA");

(async () => {
    try {

        // Create the ATA for your Wallet
        const ownerAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        // Mint some tokens!
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            ownerAta.address, 
            keypair,
            2e6
        );

        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);

        // https://explorer.solana.com/tx/4vzjooty1AgHTBouApKXBbV3Bja5xWkByj6sebLssfd7KNQeHhEpkUiTcHaMkSGDFQkky93NvPcr4WpdXGSxfcwV?cluster=devnet

        
        // Complete the Challenge!
        const completeTx = await program.methods
        .completeChallenge5()
        .accounts({
            owner: keypair.publicKey,
            ata: ownerAta.address,
            profile: profilePda,
            authority: authPda,
            mint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID 
        })
        .signers([
            keypair
        ]).rpc();

        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${completeTx}?cluster=devnet`);

        // https://explorer.solana.com/tx/3AVP8Q9uqukohj3UzWQf3QbXmRSqu6yvC95kzZFLHRdobjqfNQFhnK5h1YeFF2iRru1b4Rh7jNXuh4SnuiwyBMvf?cluster=devnet

    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();