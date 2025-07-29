import { TextHoverEffect } from "@/components/ui/text-hover-effect";
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
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Textarea } from "@/components/ui/textarea";
import bs58 from "bs58";
import { ed25519 } from "@noble/curves/ed25519";
import { toast } from "sonner";

export default function Airdrop() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [sol, setSol] = useState(0);
  const [message, setMessage] = useState("");

  async function requestAirDrop() {
    try {
      if (wallet.publicKey) {
        await connection.requestAirdrop(
          wallet.publicKey,
          sol * LAMPORTS_PER_SOL
        );
        toast.success(
          "Airdropped " + sol + " SOL to " + wallet.publicKey.toBase58()
        );
        setSol(0);
      } else {
        toast.error("Wallet not Conected");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const { publicKey, signMessage } = useWallet();

  async function signMes() {
    try {
      if (!publicKey) throw new Error("Wallet not connected!");
      if (!signMessage)
        throw new Error("Wallet does not support message signing!");

      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      if (!ed25519.verify(signature, encodedMessage, publicKey.toBytes()))
        throw new Error("Message signature invalid!");
      toast.success(`Message signature: ${bs58.encode(signature)}`);
      setMessage("");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <>
      <div className="bg-black p-6 " id="airdrop/sign">
        <TextHoverEffect text="AIR/SIGN" />

        <div className="w-full lg:flex place-content-center items-center justify-around">
          <div className="flex place-content-center">
            <Card className="w-[30rem] mb-8 md:mb-18">
              <CardHeader>
                <CardTitle>Request Airdrop</CardTitle>
                <CardDescription>
                  Note we are connecting to DEVNET
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="amount">Enter Amount of SOL</Label>
                      </div>
                      <Input
                        id="SOL Required"
                        type="text"
                        required
                        value={sol}
                        onChange={(e: any) => setSol(e.target.value)}
                        placeholder="Enter Sol"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full" onClick={requestAirDrop}>
                  Request Airdrop
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="flex place-content-center">
            <Card className="w-[30rem] mb-8 md:mb-18">
              <CardHeader>
                <CardTitle>Sign a Message</CardTitle>
                <CardDescription>
                  Message Signing is a Way of Getting user Approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="amount">Enter Message to Sign</Label>
                      </div>
                      <Textarea
                        id="SOL Required"
                        required
                        value={message}
                        onChange={(e: any) => setMessage(e.target.value)}
                        placeholder="Enter Message"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full" onClick={signMes}>
                  Sign
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
