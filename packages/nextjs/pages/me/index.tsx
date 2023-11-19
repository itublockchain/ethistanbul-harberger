import { useState } from "react"
import {
	Command,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { useRouter } from "next/router"
import { isBase37, generateFullMeName, base37ToId } from "@/lib/utils"
import { useContractRead, useNetwork } from "wagmi"
import { deployedContracts } from "../../contracts/deployedContracts"
import { ethers } from "ethers"

export default function Search() {
	const [isAvailable, setIsAvailable] = useState(false)
	const [domain, setDomain] = useState("")

	const router = useRouter()

	return (
		<>
			<div className="w-full h-screen flex flex-col justify-center items-center gap-3">
				<h1 className="text-4xl">SEARCH FOR A NAME!</h1>
				<Command className="md:w-1/2 w-full h-20">
					<CommandInput
						placeholder="Search .me names or ethereum addresses"
						className="overflow-hidden w-full h-12 text-[20px]"
						value={domain}
						onValueChange={(val) => {
							setDomain(val)
							if (isBase37(val)) {
								const { data, isError, isLoading } = useContractRead({
									address: deployedContracts["31337"].HarbergerNft
										.address as any,
									abi: deployedContracts["31337"].HarbergerNft.abi,
									functionName: "ownerOf",
									args: [ethers.BigNumber.from(base37ToId(val))],
								})
							}
						}}
					/>
					{domain.length > 0 && isBase37(domain) && (
						<CommandList className="">
							<CommandItem
								value={domain}
								onSelect={(value) => {
									router.push(`cards/${value}`)
									setDomain("")
								}}
								className="text-xl -mt-1"
							>
								<div className="flex justify-between">
									{generateFullMeName(domain)}
									<></>
								</div>
							</CommandItem>
						</CommandList>
					)}
				</Command>
				{isAvailable ? null : (
					<button className="text-[20px] w-[354px] h-[78px] bg-[#3DB9CF] rounded-[10px] text-white">
						Marketplace
					</button>
				)}
			</div>
		</>
	)
}
