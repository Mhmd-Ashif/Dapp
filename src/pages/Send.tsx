import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
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
import { AnimatePresence, motion, useAnimation, useInView } from "motion/react";
import { toast } from "sonner";

export function Send() {
  const [amount, setAmount] = useState(0);
  const [to, setTo] = useState("");
  const wallet: any = useWallet();
  const { connection } = useConnection();
  const [bal, setBal] = useState(0);

  // motion
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, scale: 1 });
    }
  }, [isInView, controls]);

  async function getBalance() {
    if (wallet.publicKey) {
      const balance = await connection.getBalance(wallet.publicKey);
      const av: any = balance / LAMPORTS_PER_SOL;
      setBal(parseFloat(av));
    }
  }

  useEffect(() => {
    getBalance();
  }, [wallet.publicKey]);

  async function sendTokens() {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(to),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      toast.success(`Sent ${amount} SOL to ${to}`);
      setTo("");
      setAmount(0);
      await getBalance();
    } catch (error: any) {
      console.error(error.message);
      toast.error("Unable to Send Tokens");
    }
  }

  return (
    <div
      className="h-screen w-full flex-row place-content-center p-6"
      id="send"
    >
      <h1 className="text-7xl mb-8 text-center">Send Solana Tokens</h1>
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0 }}
          animate={controls}
          transition={{ duration: 0.2 }}
          className="flex place-content-center"
        >
          {/* <input
        id="to"
        type="text"
        placeholder="To"
        onChange={(e: any) => setTo(e.target.value)}
        />
        <input
        id="amount"
        type="text"
        placeholder="Amount"
        onChange={(e: any) => setAmount(e.target.value)}
        />
        <button onClick={sendTokens}>Send</button> */}
          <Card className="w-full max-w-sm">
            <CardHeader>
              <div className="flex justify-between text-lg ">
                <h2>Current balance</h2>
                <h2 className="font-bold">{wallet.publicKey ? bal : 0} SOL</h2>
              </div>
            </CardHeader>
            <CardHeader>
              <CardTitle>Send Solana</CardTitle>
              <CardDescription>
                Enter Recipent address and solana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="to">Reciepent Public key address</Label>
                    <Input
                      id="to"
                      type="text"
                      placeholder="Recipent Address"
                      required
                      value={to}
                      onChange={(e: any) => setTo(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="amount">Amount</Label>
                    </div>
                    <Input
                      id="amount"
                      type="text"
                      required
                      value={amount}
                      onChange={(e: any) => setAmount(e.target.value)}
                      placeholder="Enter Sol"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={sendTokens}>
                Send
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
