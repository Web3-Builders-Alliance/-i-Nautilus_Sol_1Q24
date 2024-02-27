import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let tx = createNft(umi, {
        name: "RUG_Doctor",
        symbol: "WBA_RUG",
        uri: "https://arweave.net/phoPSiRxbQAFebrOY3tU7QwMaU-P_jQzOf_VyDwVPZg",
        sellerFeeBasisPoints: percentAmount(3),
        mint
    });
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);

    // https://explorer.solana.com/tx/KWFiNNz8drmYyoEzqBYF37D2g1rUwqjioMargYjtdu938UhPtVCqLy42HhxoPYbyPAJ2mQHtqT1FnVGry9hKQuv?cluster=devnet
    // Mint Address:  E3WwtLDz7BcxUDa9aP64QfiZ6PNbKGPd9XHuqXDjfXyp
    
    // The Rug
    // https://explorer.solana.com/address/E3WwtLDz7BcxUDa9aP64QfiZ6PNbKGPd9XHuqXDjfXyp?cluster=devnet


})();