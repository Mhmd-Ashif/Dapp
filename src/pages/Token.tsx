import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useEffect, useRef, useState } from "react";
// shadn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion, useInView, useAnimation } from "motion/react";
import { toast } from "sonner";

export function Token() {
  const wallet: any = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [image, setImage] = useState("");

  // motion
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, scale: 1 });
    }
  }, [isInView, controls]);

  async function createToken() {
    const mintKeypair = Keypair.generate();
    const metadata = {
      mint: mintKeypair.publicKey,
      name: name,
      symbol: symbol,
      uri: image,
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        9,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      })
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.sendTransaction(transaction, connection);

    const associatedToken = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(associatedToken.toBase58());

    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction2, connection);

    const transaction3 = new Transaction().add(
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedToken,
        wallet.publicKey,
        parseInt(supply) * LAMPORTS_PER_SOL,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction3, connection);

    toast.success("Token Mint Created!");
    setImage("");
    setName("");
    setSymbol("");
    setSupply("");
  }

  return (
    <div
      className="h-screen w-full flex-row place-content-center p-6"
      id="mint"
    >
      <h1 className="text-7xl mb-8 text-center">Create Own Tokens</h1>
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0 }}
          animate={controls}
          transition={{ duration: 0.2 }}
          className="flex place-content-center"
        >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Create Mint Tokens</CardTitle>
              <CardDescription>
                These Token are Created using Solana token 2022 program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="image">Token Image</Label>
                    <Input
                      id="image"
                      type="text"
                      placeholder="https://exampleimage.json"
                      value={image}
                      onChange={(e: any) => setImage(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name of the Token</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Name of the Token"
                      required
                      value={name}
                      onChange={(e: any) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="symbol">Symbol of the Token</Label>
                    </div>
                    <Input
                      id="symbol"
                      type="text"
                      required
                      value={symbol}
                      placeholder="Eg : SOL"
                      onChange={(e: any) => setSymbol(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="supply">Initial Supply</Label>
                    </div>
                    <Input
                      id="supply"
                      type="text"
                      required
                      value={supply}
                      placeholder="100"
                      onChange={(e: any) => setSupply(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={createToken}>
                Mint Token
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
