// import { Spotlight } from "@/components/ui/spotlight";

export default function Landing() {
  return (
    <>
      <div
        className="h-screen w-full flex  items-center justify-center bg-[url(/public/hero_bg.jpg)]  md:rounded-4xl bg-black bg-cover bg-no-repeat  antialiased "
        id="landing"
      >
        {/* <Spotlight /> */}
        <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full  md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text  bg-gradient-to-b  bg-opacity-50 ">
            Dapp <br /> For Solana Ecosystem.
          </h1>
          <p className="mt-4 font-normal text-base  max-w-lg text-center mx-auto">
            all-in-one utility dApp for interacting with the Solana blockchain.
            Connect your wallet, airdrop SOL on devnet, send tokens, sign
            messages, and create custom SPL tokens in one place.
          </p>
        </div>
      </div>
    </>
  );
}
