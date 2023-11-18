import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";

export default function CardPage() {
  const router = useRouter();
  const { domain } = router.query;
  return (
    <>
      <div className="h-screen w-full">
        <Navbar />
        <div className="w-full h-screen flex justify-center items-center">
          <div className="flex w-full gap-12 items-center justify-center">
            <div>
              <Card domain={domain as string} />
            </div>
            <div className="flex flex-col w-1/2">
                <p className="border-b-2 border-black text-[45px]">
                    OWNER:
                </p>
                <p className="border-b-2 border-black text-[45px]">
                    EXPIRE TIME: 
                </p>
                <p className="border-b-2 border-black text-[45px]">
                    PRICE:
                </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
