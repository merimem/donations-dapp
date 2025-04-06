import Loading from "@/components/layout/Loading"
import config from "@/config/contract"
import { useReadContract } from "wagmi"
import Coupon from "./Coupon"

interface CouponsProps {
  projectId: string
}

const Coupons = ({ projectId }: CouponsProps) => {
  const {
    data: coupons,
    isPending,
    error,
    refetch,
  } = useReadContract({
    address: config.CouponNFT.address,
    abi: config.CouponNFT.abi,
    functionName: "getCouponsByProject",
    args: [BigInt(projectId)],
  })

  return (
    <div className="border-2 rounded m-6 p-4 mx-auto w-[80%]">
      <h1 className="text-xl font-bold">Coupons related to this project</h1>
      <div className="grid grid-cols-4 gap-4">
        {isPending && <Loading />}
        {coupons &&
          coupons[0]?.map((id) => (
            <Coupon id={id} projectId={BigInt(projectId)} key={id} />
          ))}
      </div>
    </div>
  )
}

export default Coupons
