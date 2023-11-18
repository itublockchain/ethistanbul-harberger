import Image from "next/image";
import logo from "../public/logo.png";

export default function Navbar({
  extraComponent,
}: {
  extraComponent?: JSX.Element;
}) {
  return (
    <div className="sticky top-0 w-full h-32 bg-white mb-4">
      <div className="w-full h-full flex justify-end items-center px-10">
        {extraComponent}
        <Image src={logo} alt="logo" width={50} />
      </div>
      <div className="h-[1px] w-11/12 mx-auto bg-black"></div>
    </div>
  );
}
