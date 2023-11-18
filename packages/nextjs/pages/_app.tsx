import "../globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import type { AppProps } from "next/app"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import {
	arbitrum,
	goerli,
	mainnet,
	optimism,
	polygon,
	base,
	zora,
	hardhat,
} from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { Lexend } from "next/font/google"
import Navbar from "@/components/Navbar"

const lexend = Lexend({ subsets: ["latin"] })
const { chains, publicClient, webSocketPublicClient } = configureChains(
	[
		hardhat /*localhost is not the same with hardhat */,
		mainnet,
		polygon,
		optimism,
		arbitrum,
		base,
		zora,
		...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
	],
	[publicProvider()]
)

const { connectors } = getDefaultWallets({
	appName: "RainbowKit App",
	projectId: "ca4386934bfc22480a359d69740ba7df",
	chains,
})

const wagmiConfig = createConfig({
	autoConnect: true,
	connectors,
	publicClient,
	webSocketPublicClient,
})

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<div className={lexend.className}>
			<WagmiConfig config={wagmiConfig}>
				<RainbowKitProvider chains={chains}>
					<div className="flex flex-col min-h-screen w-screen item-center justify-start px-4 bg-white">
						<Navbar />
						<Component {...pageProps} />
					</div>
				</RainbowKitProvider>
			</WagmiConfig>
		</div>
	)
}

export default MyApp
