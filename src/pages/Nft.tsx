import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
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
  createSetAuthorityInstruction,
  AuthorityType,
  getMint,
  getMetadataPointerState,
  getTokenMetadata,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createRemoveKeyInstruction,
  createUpdateFieldInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";
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

export function Nft() {
  const wallet: any = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
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
    try {
      const mintKeypair = Keypair.generate();
      const metadata: TokenMetadata = {
        updateAuthority: wallet.publicKey,
        mint: mintKeypair.publicKey,
        name: name || "Sample Token",
        symbol: symbol || "STK",
        uri:
          image ||
          "https://qn-shared.quicknode-ipfs.com/ipfs/QmQFh6WuQaWAMLsw9paLZYvTsdL5xJESzcoSxzb6ZU3Gjx",
        additionalMetadata: [
          ["Background", "Blue"],
          ["WrongData", "DeleteMe!"],
          ["Points", "0"],
        ],
      };

      const decimals = 0;
      const mintAmount = 1;

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
          decimals,
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: wallet.publicKey,
          mint: mintKeypair.publicKey,
          mintAuthority: wallet.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: wallet.publicKey,
          field: metadata.additionalMetadata[0][0],
          value: metadata.additionalMetadata[0][1],
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: wallet.publicKey,
          field: metadata.additionalMetadata[1][0],
          value: metadata.additionalMetadata[1][1],
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: wallet.publicKey,
          field: metadata.additionalMetadata[2][0],
          value: metadata.additionalMetadata[2][1],
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

      console.log("ata " + associatedToken.toBase58());

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          mintAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        ),
        createRemoveKeyInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: wallet.publicKey,
          key: "WrongData",
          idempotent: true,
        }),
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction2, connection);

      // increment points

      const mintInfo = await getMint(
        connection,
        mintKeypair.publicKey,
        "confirmed",
        TOKEN_2022_PROGRAM_ID
      );

      const metadataPointer = getMetadataPointerState(mintInfo);
      if (!metadataPointer || !metadataPointer.metadataAddress) {
        throw new Error("No metadata pointer found");
        // toast.error <- add this in catch block
      }

      const findMetaData = await getTokenMetadata(
        connection,
        metadataPointer?.metadataAddress
      );

      if (!findMetaData) {
        throw new Error("no metadata found");
      }

      if (findMetaData.mint.toBase58() != mintKeypair.publicKey.toBase58()) {
        throw new Error("Metadata doesn't matches mint");
      }

      const [key, currentPoints] =
        findMetaData.additionalMetadata.find(([key, _]) => key == "Points") ??
        [];
      console.log(key);
      let pointsAsNumber = parseInt(currentPoints ?? "0");
      pointsAsNumber += 10;

      const transaction3 = new Transaction().add(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: wallet.publicKey,
          field: "Points",
          value: pointsAsNumber.toString(),
        })
      );

      await wallet.sendTransaction(transaction3, connection);

      toast.success("Token Mint Created!");
      console.log("mintkeypair public key " + mintKeypair.publicKey.toBase58());
      setImage("");
      setName("");
      setSymbol("");
    } catch (error: any) {
      console.log(error);
      // toast.error(error);
    }
  }

  return (
    <div
      className="h-screen w-full flex-row place-content-center p-6 bg-black"
      id="nft"
    >
      <h1 className="text-7xl mb-3 text-center">Create Your Own Nft's </h1>
      <p className="text-xl mb-8 text-center">
        Nft's are the Non fungible Tokens Created using Solana the SPL Metadata
        Token Extension (in TestNet Environment)
      </p>
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
                    <Label htmlFor="image">NFT Metadata URI</Label>
                    <Input
                      id="image"
                      type="text"
                      placeholder="https://ipfs.io/ipfs/Qm.../metadata.json"
                      value={image}
                      onChange={(e: any) => setImage(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Provide the URI to your JSON metadata file containing
                      image
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name of the NFT</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tigerhound"
                      required
                      value={name}
                      onChange={(e: any) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="symbol">Symbol of the NFT</Label>
                    </div>
                    <Input
                      id="symbol"
                      type="text"
                      required
                      value={symbol}
                      placeholder="TGH"
                      onChange={(e: any) => setSymbol(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={createToken}>
                Create NFT
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
