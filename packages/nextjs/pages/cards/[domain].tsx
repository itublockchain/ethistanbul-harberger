import { useRouter } from "next/router"
import Navbar from "@/components/Navbar";

export default function CardPage() {

    const router = useRouter();
    const { domain } = router.query;
    return(<>
    <div>
        <Navbar />
        {domain}
    </div>
    </>)
}