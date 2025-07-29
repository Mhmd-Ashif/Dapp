import { Spotlight } from "@/components/ui/spotlight";

export default function Landing() {
  return (
    <>
      <div
        className="h-screen w-full flex  items-center justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden"
        id="landing"
      >
        <Spotlight />
        <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full  md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 ">
            Dapp <br /> For Solana Ecosystem.
          </h1>
          <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            all-in-one utility dApp for interacting with the Solana blockchain.
            Connect your wallet, airdrop SOL on devnet, send tokens, sign
            messages, and create custom SPL tokens in one place.
          </p>
        </div>
      </div>
    </>
  );
}
