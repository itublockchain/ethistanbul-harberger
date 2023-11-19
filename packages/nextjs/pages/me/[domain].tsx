import { useRouter } from "next/router"
import Card from "@/components/Card"
import { useContractRead, useContractReads, useContractWrite } from "wagmi"
import { deployedContracts } from "@/contracts/deployedContracts"
import { base37ToId, isBase37 } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"
import { useAccount } from "wagmi"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { useIsMounted } from "../../hooks/useIsMounted"

const MAX_BPS = 10000

export default function CardPage() {
	const isMounted = useIsMounted()

	const router = useRouter()
	const { domain } = router.query

	const [sliderValue, setSliderValue] = useState(10)
	const account = useAccount()
	const { data, isError, isLoading, refetch } = useContractReads({
		contracts: [
			{
				address: deployedContracts["31337"].HarbergerNft.address as any,
				abi: deployedContracts["31337"].HarbergerNft.abi as any,
				functionName: "ownerOf",
				args: [base37ToId((domain as string) || "").toString()],
			},
			{
				address: deployedContracts["31337"].HarbergerNft.address as any,
				abi: deployedContracts["31337"].HarbergerNft.abi as any,
				functionName: "expirationDates",
				args: [base37ToId((domain as string) || "").toString()],
			},
			{
				address: deployedContracts["31337"].HarbergerNft.address as any,
				abi: deployedContracts["31337"].HarbergerNft.abi as any,
				functionName: "calculateBuyPrice",
				args: [base37ToId((domain as string) || "").toString()],
			},
			{
				address: deployedContracts["31337"].HarbergerNft.address as any,
				abi: deployedContracts["31337"].HarbergerNft.abi as any,
				functionName: "yearlyTaxBps",
			},
		],
		allowFailure: true,
	})

	const {
		data: writeData,
		isLoading: writeLoading,
		isSuccess: writeSuccess,
		write,
	} = useContractWrite({
		address: deployedContracts["31337"].HarbergerNft.address as any,
		abi: deployedContracts["31337"].HarbergerNft.abi,
		functionName: "payTax",
		args: [base37ToId((domain as string) || "").toString()],
		value: ethers.utils.parseEther("1"),
	})

	if (!isMounted) return null

	const isNotMinted = data && data[0].status == "failure"

	const isHarberger =
		(domain ? domain : "").length <= 8 && isBase37((domain as string) || "")

	return (
		<>
			<>
				{isHarberger ? (
					<>
						{data && (
							<div className="h-[800px] w-full">
								<div className="w-full h-full flex justify-center items-center">
									<div className="flex w-full gap-12 items-center justify-center">
										<div>
											<Card domain={domain as string} />
										</div>
										{isNotMinted ? (
											<Button variant="outline">Mint for</Button>
										) : (
											<div className="flex flex-col w-1/2">
												<span className="border-b-2 border-black text-xl flex gap-2 font-bold">
													OWNER:{" "}
													<p className="text-md font-normal">
														{data[0].result}
													</p>
												</span>
												<span className="border-b-2 border-black text-xl flex gap-2 font-bold">
													EXPIRE TIME:{" "}
													<p className="text-md font-normal">
														{new Date(
															Number(data[1].result) * 1000 +
																(writeSuccess ? 123783431 : 0)
														).toUTCString()}
													</p>
												</span>
												<span className="border-b-2 border-black text-xl flex gap-2 font-bold">
													PRICE:{" "}
													<p className="text-md font-normal">
														{ethers.utils
															.formatEther(Number(data[2].result).toString())
															.toString()}{" "}
														ETH
													</p>
												</span>
												<div className="flex items-center justify-center mt-2">
													{account.address === data[0].result ? (
														<Dialog>
															<DialogTrigger asChild>
																<Button className="w-40">Extend</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>
																		Pay tax to extend your name's expire date
																	</DialogTitle>
																	<DialogDescription className="pt-8">
																		<div className="flex flex-col gap-4">
																			<Slider
																				onValueChange={(val) => {
																					setSliderValue(val[0])
																				}}
																				defaultValue={[sliderValue]}
																				max={1000}
																				step={1}
																			/>
																			<div className="flex justify-between">
																				<div className="flex flex-row gap-2">
																					<p className="font-semibold">Pay</p>
																					{ethers.utils.formatEther(
																						ethers.BigNumber.from(
																							Number(data[2].result)
																						)
																							.mul(Number(data[3].result))
																							.mul(365 * 24 * 60 * 60)
																							.mul(sliderValue * 24 * 60 * 60)
																							.div(MAX_BPS)
																							.toString()
																					)}{" "}
																					ETH
																				</div>
																				<span className="flex gap-1">
																					to extend{" "}
																					<p className="font-bold">
																						{sliderValue}
																					</p>{" "}
																					days
																				</span>
																			</div>
																			<div className="flex">
																				<Button onClick={() => write()}>
																					Apply
																				</Button>
																				{writeLoading && (
																					<div>Check Wallet</div>
																				)}
																				{writeSuccess && (
																					<div>
																						Transaction: {JSON.stringify(data)}
																					</div>
																				)}
																			</div>
																		</div>
																	</DialogDescription>
																</DialogHeader>
															</DialogContent>
														</Dialog>
													) : (
														<Button className="w-40">Buy</Button>
													)}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</>
				) : (
					<>This is not a harberger name</>
				)}
			</>
		</>
	)
}
