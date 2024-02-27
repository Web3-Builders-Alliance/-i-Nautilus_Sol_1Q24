import { SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address } from "@project-serum/anchor"
import { WbaPrereq } from "./programs/idl";
import * as IDL from "./programs/idl.json";

import { 
    loadWalletFromFilepath,
    getConnection
 } from "./utils";

// Load Personal Wallet from localfile
const keypair = loadWalletFromFilepath('/home/ubuntu/.config/solana/id.json');
console.log(`Retrieved Wallet KeyPair: ${keypair.publicKey}`);

// Create DevNet Connection
const connection = getConnection('devnet');
console.log(`Connected to: ${connection.rpcEndpoint}`);

// Github account
const github = Buffer.from("ClearflySystems", "utf8");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {commitment: "confirmed"});

// Create our program
const typedIDL = (IDL as unknown) as WbaPrereq;
const program = new Program<WbaPrereq>(typedIDL, "HC2oqz2p6DEWfrahenqdq2moUcga9c9biqRBcdK3XKU1" as Address, provider);


// Create the PDA for our enrollment account
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync([
    Buffer.from("prereq"),
    keypair.publicKey.toBuffer()
], program.programId);


// Execute our enrollment transaction
(async () => {
    try {
    const tx = await program.methods.complete(github)
        .accounts({
            signer: keypair.publicKey,
            prereq: enrollment_key,
            systemProgram: SystemProgram.programId,
        })
        .signers([keypair])
        .rpc();
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();