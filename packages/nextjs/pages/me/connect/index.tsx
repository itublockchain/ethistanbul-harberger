import Image from "next/image";
import logo from "../../public/logo.png";

export default function Connect() {

  
    return <>
    <div className="w-full h-screen flex flex-col justify-center items-center gap-16">
        <Image src={logo} alt="logo" />
        <w3m-button />
    </div>
    </>
}