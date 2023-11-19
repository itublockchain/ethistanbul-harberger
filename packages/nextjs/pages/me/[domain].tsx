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
import { useState } from "react"

const MAX_BPS = 10000

export default function CardPage() {
	const account = useAccount()
	const router = useRouter()
	const { domain } = router.query
	const [sliderValue, setSliderValue] = useState(10)

	const {
		data: writeData,
		isLoading: writeLoading,
		isSuccess: writeSuccess,
		write,
	} = useContractWrite({
		address: deployedContracts["31337"].HarbergerNft.address as any,
		abi: deployedContracts["31337"].HarbergerNft.abi,
		functionName: "feed",
	})

	const { data, isError, isLoading } = useContractReads({
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

	console.log(data)

	const isNotMinted = data && data[0].status == "failure"

	const isHarberger =
		(domain ? domain : "").length <= 8 && isBase37((domain as string) || "")

	return (
		<>
			{isLoading ? (
				<>
					<svg
						aria-hidden="true"
						// eslint-disable-next-line tailwindcss/no-custom-classname
						className={`mr-2 inline animate-spin text-gray-600 w-4 h-4`}
						viewBox="0 0 100 101"
						fill="black"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
				</>
			) : (
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
													<p className="border-b-2 border-black text-xl flex gap-2 font-bold">
														OWNER:{" "}
														<p className="text-md font-normal">
															{data[0].result}
														</p>
													</p>
													<p className="border-b-2 border-black text-xl flex gap-2 font-bold">
														EXPIRE TIME:{" "}
														<p className="text-md font-normal">
															{new Date(
																Number(data[1].result) * 1000
															).toUTCString()}
														</p>
													</p>
													<p className="border-b-2 border-black text-xl flex gap-2 font-bold">
														PRICE:{" "}
														<p className="text-md font-normal">
															{ethers.utils
																.formatEther(Number(data[2].result).toString())
																.toString()}{" "}
															ETH
														</p>
													</p>
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
																								.div(MAX_BPS)
																								.mul(365 * 24 * 60 * 60)
																								.mul(sliderValue * 24 * 60 * 60)
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
																				<Button onClick={() => {}}>
																					Apply
																				</Button>
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
			)}
		</>
	)
}
