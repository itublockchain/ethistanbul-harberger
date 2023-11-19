import "../globals.css"
import type { AppProps } from "next/app"
import Navbar from "@/components/Navbar"
import { Lexend } from "next/font/google"
const lexend = Lexend({ subsets: ["latin"] })

import { Web3Modal } from "../context/Web3Modal"

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Web3Modal>
			<div className={lexend.className}>
				<Navbar />
				<Component {...pageProps} />
			</div>
		</Web3Modal>
	)
}

export default MyApp
