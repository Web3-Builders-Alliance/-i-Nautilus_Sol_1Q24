import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        const image = await readFile('/home/ubuntu/projects/wba-solana-starter/ts/images/generug.png');
        console.log( image.length );
        const genericImage = createGenericFile(image, 'generug.png');

        const [myUri] = await umi.uploader.upload([genericImage]);
        console.log("Your image URI: ", myUri);

        // https://arweave.net/BFhSa6nI_axxuKW61su2VaXFT7hHek7grbD1g4TopGA
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
