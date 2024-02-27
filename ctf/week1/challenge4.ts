import { Connection, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address } from "@project-serum/anchor"
import { Week1, IDL } from "./programs/week1";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
    MPL_TOKEN_METADATA_PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
  } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";

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

// Paste here the mint address for challenge1 token or createmint4?? 
const mint = new PublicKey("4exjYjQY55uV2mZBTEBoiC8D8Dc55LA7VEpPnKWKngne");

// Create the PDA for the Challenge1 Vault
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault4"), keypair.publicKey.toBuffer(), mint.toBuffer()], program.programId)[0];

const metadata_program = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Create PDA for token metadata
const metadata_seeds = [
    Buffer.from('metadata'),
    metadata_program.toBuffer(),
    mint.toBuffer(),
];
const metadata = PublicKey.findProgramAddressSync(metadata_seeds, metadata_program)[0];


const umi = createUmi('https://api.devnet.solana.com');
const umikp = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, umikp);
umi.use(signerIdentity(createSignerFromKeypair(umi, umikp)));

(async () => {

        // NB if you get TokenAccountNotFoundError, wait a few seconds and try again!

        //Create the ATA for your Wallet
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

        // Create Metatdata account
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: fromWeb3JsPublicKey(metadata),
            mint: fromWeb3JsPublicKey(mint),
            payer: signer,
            mintAuthority: signer,
            updateAuthority: fromWeb3JsPublicKey(keypair.publicKey)
        }

        let data: DataV2Args = {
            name: 'WBA_CTF1',
            symbol: 'WBA_CTF1',
            uri: '',
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data:data,
            isMutable:true,
            collectionDetails:null
        }

        let tx = createMetadataAccountV3(umi,{...accounts, ...args})
        let result = await tx.sendAndConfirm(umi);
        const signature = base58.deserialize(result.signature);
        
        //console.log(`Success! Check out your Metadat TX here: 
        //https://explorer.solana.com/tx/${result}?cluster=devnet`);
        
        // Complete the Challenge!
        const completeTx = await program.methods.completeChallenge4()
        .accounts({
          owner: keypair.publicKey,
          ata: ownerAta.address,
          profile: profilePda,
          vault: vault,
          metadata: metadata,
          mint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadataProgram: TOKEN_METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID 
        })
        .signers([
            keypair
        ]).rpc();

        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${completeTx}?cluster=devnet`);

        //  https://explorer.solana.com/tx/2HN8W39J8L5dvJ4aBxe3TsWBGB9vBVw8cDNQrahJMBC2NFNrCJ68FScNPDuqQXfaXaqHjABDknitBq9MygTQjqwG?cluster=devnet
})();