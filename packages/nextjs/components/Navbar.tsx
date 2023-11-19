import Image from "next/image"
import logo from "../public/logo.png"

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"

export default function Navbar({
	extraComponent,
}: {
	extraComponent?: JSX.Element
}) {
	const router = useRouter()

	return (
		<div className="sticky top-0 w-full h-24 bg-white mb-4 text-black">
			<div className="w-full h-full flex justify-between items-center px-10">
				<a href="/" className="flex items-center justify-center gap-6">
					<Image src={logo} alt="logo" width={50} />
					<p className="md:text-4xl text-2xl md:block hidden">APP NAME</p>
				</a>
				<div className="hidden flex-row gap-4 md:flex">
					<div>
						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem className="">
									<Link href="/" legacyBehavior passHref>
										<NavigationMenuLink
											className={navigationMenuTriggerStyle()}
										>
											About
										</NavigationMenuLink>
									</Link>
								</NavigationMenuItem>
								<NavigationMenuItem className="">
									<Link href="/me" legacyBehavior passHref>
										<NavigationMenuLink
											className={navigationMenuTriggerStyle()}
										>
											Me Names
										</NavigationMenuLink>
									</Link>
								</NavigationMenuItem>
								<NavigationMenuItem className="">
									<Link href="/app" legacyBehavior passHref>
										<NavigationMenuLink
											className={navigationMenuTriggerStyle()}
										>
											Launch App
										</NavigationMenuLink>
									</Link>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					<div>
						<ConnectButton.Custom>
							{({
								account,
								chain,
								openAccountModal,
								openChainModal,
								openConnectModal,
								authenticationStatus,
								mounted,
							}) => {
								// Note: If your app doesn't use authentication, you
								// can remove all 'authenticationStatus' checks
								const ready = mounted && authenticationStatus !== "loading"
								const connected =
									ready &&
									account &&
									chain &&
									(!authenticationStatus ||
										authenticationStatus === "authenticated")

								return (
									<div
										{...(!ready && {
											"aria-hidden": true,
											style: {
												opacity: 0,
												pointerEvents: "none",
												userSelect: "none",
											},
										})}
									>
										{(() => {
											if (!connected) {
												return (
													<button
														onClick={openConnectModal}
														type="button"
														className="w-32 h-12 bg-[#3DB9CF] hover:bg-[#19D9CF] rounded-md text-white text-md"
													>
														Connect Wallet
													</button>
												)
											}

											if (chain.unsupported) {
												return (
													<button
														onClick={openChainModal}
														type="button"
														className="bg-[#3DB9CF] rounded-md text-white text-md"
													>
														Wrong network
													</button>
												)
											}

											return (
												<div style={{ display: "flex", gap: 4 }}>
													<button
														className="w-32 h-12 bg-[#3DB9CF] hover:bg-[#19D9CF] rounded-md text-white text-md flex justify-center items-center"
														onClick={openChainModal}
														style={{ display: "flex", alignItems: "center" }}
														type="button"
													>
														{chain.hasIcon && (
															<div
																style={{
																	background: chain.iconBackground,
																	width: 12,
																	height: 12,
																	borderRadius: 999,
																	overflow: "hidden",
																	marginRight: 4,
																}}
															>
																{chain.iconUrl && (
																	<img
																		alt={chain.name ?? "Chain icon"}
																		src={chain.iconUrl}
																		style={{ width: 12, height: 12 }}
																	/>
																)}
															</div>
														)}
														{chain.name}
													</button>

													<button
														onClick={openAccountModal}
														type="button"
														className="w-48 h-12 bg-[#3DB9CF] hover:bg-[#19D9CF] rounded-md text-white text-sm"
													>
														{account.displayName}
														{account.displayBalance
															? ` (${account.displayBalance})`
															: ""}
													</button>
												</div>
											)
										})()}
									</div>
								)
							}}
						</ConnectButton.Custom>
					</div>
				</div>
			</div>
			<div className="h-[1px] w-11/12 mx-auto bg-black" />
		</div>
	)
}
