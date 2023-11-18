import Image from "next/image"
import logo from "../public/logo.png"
import { useRouter } from "next/router"

export default function Card({domain} : {domain: string}) {
    const router = useRouter()
    return <>
    <div className="flex flex-col justify-around items-center w-[400px] h-[400px] border-[7px] border-[#3DB9CF] rounded-[15px] text-[40px] mx-auto">
        <Image src={logo} alt="NFT Image" width={150}/>
        <h1 className="hover:cursor-pointer" onClick={() => router.push("/cards/" + domain)}>{domain}</h1>
    </div>
    </>
}