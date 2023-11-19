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
					<p className="md:text-4xl text-2xl md:block hidden">meETH</p>
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
						<w3m-button />
					</div>
				</div>
			</div>
			<div className="h-[1px] w-11/12 mx-auto bg-black" />
		</div>
	)
}
