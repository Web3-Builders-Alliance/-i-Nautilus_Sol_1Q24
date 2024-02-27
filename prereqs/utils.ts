import { 
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction 
} from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";


/**
 * Generate a new KeyPair
 * @returns Keypair
 */
export const generateNewKeyPair = ():Keypair => {
    return Keypair.generate();
}


/**
 * Save Private Key to file using public key as its filename 
 * @param kp 
 * @returns string
 */
export const saveKeyPair = (kp:Keypair):string => {
    const filename = kp.publicKey.toBase58() + '.json';
    const output: number[] = Array.from(kp.secretKey);
    fs.writeFileSync(filename, JSON.stringify(output));
    return filename;
}


/**
 * Convert Binary Private Key from an Uint8Array to Base58 encoded String
 * @param input 
 * @returns string
 */
export const walletUint8ArrayToBase58 = (input:Uint8Array):string => {
    const buffer = Buffer.from(input);
    return bs58.encode(buffer);
}


/**
 * Convert Base58 Private Key into binary Uint8Array 
 * @param input 
 * @returns Uint8Array
 */
export const walletBase58ToUint8Array = (input:string):Uint8Array => {
    return bs58.decode(input);
}


/**
 * Create KeyPair from existing Private Key.
 * Support input of Base58 Strings, Number Arrays or Binary Array
 * 
 * @param input 
 * @returns Keypair
 */
export const walletFromPrivateKey = (input:string | number[] | Uint8Array):Keypair => {
    if(typeof input === 'string'){
        input = walletBase58ToUint8Array(input);
    }
    if(Array.isArray(input)){
        input = new Uint8Array(input);
    }
    return Keypair.fromSecretKey(input);
}


/**
 * Load Wallet from File Path
 * @param path 
 * @returns Keypair
 */
export const loadWalletFromFilepath = (path:string):Keypair => {
    const privateKeyObject = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return walletFromPrivateKey(privateKeyObject);
}


/**
 * Convert SOL to Lamports
 * @param sol 
 * @returns number
 */
export const solToLamports = (sol:number): number => {
    return sol * LAMPORTS_PER_SOL;
}


/**
 * Convert Lamports to SOL
 * @param sol 
 * @returns number
 */
export const lamportsToSol = (lamports:number): number => {
    return lamports? lamports / LAMPORTS_PER_SOL : 0;
}


/**
 * Create Solana RPC Connection to localnet|devnet|testnet|mainnet|custom rpc
 * @param cluster 
 * @returns Connection
 */
export const getConnection = (cluster:string):Connection => {
    let uri = cluster;
    switch(cluster){
        case 'devnet':
        case 'testnet':
            uri = `https://api.${cluster}.solana.com`;
            break;
        case 'mainnet':
            uri = `https://api.mainnet-beta.solana.com`;
            break;
        case 'localnet':
        case 'localhost':
            uri = `http://localhost:8899`;
            break;
    }
    return new Connection(uri);
}


/**
 * Airdrop tokens to a selected Wallet using the current Connection
 * @param wallet 
 * @param connection 
 * @returns Promise<string|undefined>
 */
export const requestAirdrop = async (wallet:Keypair, connection:Connection): Promise<string|undefined> => {
    if(!wallet) return
    try {
        const tx = await connection.requestAirdrop(
            wallet.publicKey,
            LAMPORTS_PER_SOL*2
        );
        return tx;
    } catch(e){ 
        console.error(`Airdrop failed: ${e}`);
    }
}


/**
 * Tansfer Funds [from] Wallet [to] public wallet address
 * If Amount exceeds balance all funds are transfered minus the fee.
 * @param connection 
 * @param from 
 * @param to 
 * @param amount 
 */
export const transferFunds = async (connection:Connection, from:Keypair, to:PublicKey, send_lamports:number): Promise<string|undefined> => {
    try {
        // Get balance of dev wallet
        const balance = await connection.getBalance(from.publicKey);
        // Check we don't exceed balance
        if(send_lamports > balance) send_lamports = balance;

        // Create Transfer Transaction
        const transaction = new Transaction().add( 
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: send_lamports,
            })
        );

        // Get Blockhash
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

        // Set Fee Payer
        transaction.feePayer = from.publicKey;

        // Calculate fee 
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;

        // If sending all funds subtract fee
        if((send_lamports + fee) >= balance){

            // Remove our transfer instruction to replace it
            transaction.instructions.pop();

            // Submit adjusted ammount to send
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: from.publicKey,
                    toPubkey: to,
                    lamports: send_lamports - fee,
                })
            );
        }

        // Commit final transaction
        const tx = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        return tx;
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}
