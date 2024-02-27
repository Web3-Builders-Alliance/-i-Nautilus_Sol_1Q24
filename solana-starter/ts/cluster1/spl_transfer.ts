import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("3vgiHEwpBz68kUr73RWBX5kwSvmoA6dYJ8gpJ4VceJ79");

// Recipient address
const to = new PublicKey("56ZAEkqHHhtk3EGp93bAXBTS2jQNec759UfSwi5SywN3");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        let fromAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        console.log(fromAccount.address);

        // Get the token account of the toWallet address, and if it does not exist, create it
        let toAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
        );

        console.log(toAccount.address);

        // Transfer the new token to the "toTokenAccount" we just created
        const tx = await transfer(
            connection,
            keypair,
            fromAccount.address,
            toAccount.address,
            keypair,
            1_000_000
        );
        console.log(`Transfer Token: ${tx}`);

    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();