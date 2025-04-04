import { formatEther } from "viem"
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import config from "~/config/contract"

const Coupon = ({ id, projectId }: { id: bigint; projectId: bigint }) => {
  const {
    data: couponValue,
    isPending,
    error,
    refetch,
  } = useReadContract({
    address: config.CouponNFT.address,
    abi: config.CouponNFT.abi,
    functionName: "getCouponValue",
    args: [id, projectId],
  })

  const {
    data: hash,
    error: errorContract,

    writeContract,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })
  const handleRedeem = async () => {
    try {
      await writeContract({
        address: config.CouponNFT.address,
        abi: config.CouponNFT.abi,
        functionName: "redeemCoupon",
        args: [id, projectId],
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <div className="card bg-accent text-primary-content w-48 m-4">
        <div className="card-body">
          <h2 className="card-title">Coupon {id.toString()}</h2>
          <p>Contains {couponValue ? formatEther(couponValue) : 0} Eth</p>
          <div className="card-actions justify-end h-24">
            <button className="btn" onClick={handleRedeem}>
              Redeem Coupon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Coupon
