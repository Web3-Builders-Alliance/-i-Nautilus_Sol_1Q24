import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader  } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://arweave.net/BFhSa6nI_axxuKW61su2VaXFT7hHek7grbD1g4TopGA"
        const metadata = {
            name: "RUG_Doctor",
            symbol: "WBA_RUG",
            description: "The Rug doctor will come and clean out your rugs",
            image: image,
            attributes: [
                {trait_type: 'ruggable', value: '0'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: []
        };

        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your image Metadata URI: ", myUri);

        // https://arweave.net/phoPSiRxbQAFebrOY3tU7QwMaU-P_jQzOf_VyDwVPZg
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();