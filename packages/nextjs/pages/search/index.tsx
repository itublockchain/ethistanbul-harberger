import Image from "next/image";
import logo from "../../public/logo.png";
import { useState } from "react";

export default function Search() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [domain, setDomain] = useState("");

  console.log(domain)
  return (
    <>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <Image src={logo} alt="logo" className="mb-[80px]" />
        <h1 className="text-[35px]">SEARCH FOR A NAME!</h1>
        <input
          onChange={(e) => {
            setDomain(e.currentTarget.value  + ".me");
          }}
          type="text"
          className="w-[596px] h-[101px] rounded-[15px] border-[5px] border-black text-[50px] px-4"
        />
        <p className="text-[#3DB9CF] text-[20px]">
          {isAvailable ? "Available" : "Taken"}
        </p>
        {isAvailable ? null : (
          <button className="text-[20px] w-[354px] h-[78px] bg-[#3DB9CF] rounded-[10px] text-white">
            Marketplace
          </button>
        )}
      </div>
    </>
  );
}
