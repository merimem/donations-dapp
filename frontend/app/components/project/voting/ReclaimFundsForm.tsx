import React from "react"

const ReclaimFundsForm = () => {
  return (
    <div className="mx-auto mt-4 rounded-md border-2 p-4 ">
      <h3 className="font-semibold tracking-tight text-2xl">Reclaim funds</h3>
      <form>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Funds will be released in the form of coupons. How many coupons do
              you need, and what amount should each coupon represent?
            </label>
          </div>
          <label className="label" htmlFor="title">
            Number of coupons
          </label>
          <input
            type="number"
            className="flex h-10  rounded-md border  px-3 py-2 text-sm"
            placeholder="1 coupon"
          />
        </div>
        <div className="mt-6">
          <button
            className="mx-8 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 "
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReclaimFundsForm
