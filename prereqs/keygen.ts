import {
    generateNewKeyPair,
    saveKeyPair,
    walletUint8ArrayToBase58,
    walletFromPrivateKey
} from './utils';


// Create New KeyPair
let kp = generateNewKeyPair();
console.log(`You've generated a new Solana wallet: ${kp.publicKey.toBase58()} \n[${kp.secretKey}] \n`);


// Write out to file
let filename = saveKeyPair(kp);
console.log(`Keypair saved to: ${filename} \n`);


// Get Private Key as Base58 Human Readable format
let pkBase58 = walletUint8ArrayToBase58(kp.secretKey);
console.log(`Private Key encoded as base58:  ${pkBase58} \n`);


// Generate KeyPair Object from PrivateKey
let newKeyPair = walletFromPrivateKey(pkBase58);
console.log(`New KeyPair:  ${newKeyPair.publicKey.toBase58()} should match original KeyPair: ${kp.publicKey.toBase58()} \n`);

