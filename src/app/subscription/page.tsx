"use client"

import SpecialOfferCard from '@/components/Section/SpecialOfferCard'
import { api, ENDPOINT } from '@/lib/endpoint';
import Image from 'next/image'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { updateUserPremiumDetails } from '@/redux/userSlice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';

declare const Razorpay: any;

function Page() {
    const [activePrice, setActivePrice] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const router = useRouter();


    function loadScript() {
        return new Promise<void>(function(resolve, reject) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve();
            }

            script.onerror = () => {
                reject();
            }
            document.body.appendChild(script);
        })
    }
    const offers = [
            {
                title: "Premium Monthly",
                features: [
                    "Ad-Free (except sports & live)",
                    "Includes all Premium content",
                    "Any 1 device at a time (up to Asli 4K quality)",
                    "Download and watch anytime"
                ],
                price: "199",
                originalPrice: "400",
                discountLabel: "50% OFF",
                duration: "1 Month"
            },
            {
                title: "Family",
                features: ["Enjoy all Premium plan benefits on up to 4 devices"],
                price: "89",
                originalPrice: "149",
                discountLabel: "40% OFF",
                duration: "1 Month"
            }
        ]
    async function handlePaymentButton() {
        if (!user.isLoggedIn) {
           return toast.warning("User need to login first");
        }

        if (!activePrice) {
            return toast.warning("Select a plan before payment");
        }
        // 1. Sending a Request to the Backend
        const response = await api.post(ENDPOINT.payment, {
            amount: activePrice,
            email: user.user?.email
        });
        console.log(response);

        const order = response.data.order; 


        console.log(order);
        // 2. load Razorpay Script 
        await loadScript();

        // create the order object 
        const finalOrderObject = {
            key: "rzp_test_RHB51cyj58hxCX",
            "amount": order.amount, 
            "currency": order.currency,
            "name": "Jio Clone",
            "description": "Premium",
            "order_id": order.id, 
            "prefill": {
                "name": user.user?.name, 
                "email": user.user?.email, 
            },
            "handler": async function() {
                toast.success("Payment Successfull");
                try {
                  const updatePremium = await api.post(ENDPOINT.updatePremium, {
                     email: user.user?.email
                  })

                  if (updatePremium.data.status === "success") {
                     dispatch(updateUserPremiumDetails(true));
                     router.push("/");
                  }
                } catch(err) {
                    console.log(err);
                }
            },
        }

        const rzpl = new Razorpay(finalOrderObject);
        rzpl.on("payment.failed", function(response: any) {
            toast("reason " + response.error.reason)
        })
        rzpl.open();
    }
  return (
    <div className='h-[100vh] w-full mt-[70px] text-white'>
      <Image src={"/bg.jpg"} height={720} width={1280} quality={30} className=' object-cover h-full w-full absolute -z-50' alt='Image'/>

      <div className="lg:pt-20 px-10 pt-10">
                    <h1 className="md:text-4xl text-2xl  leading-none font-black md:text-12 mb-4 text-nowrap">
                        JioCinema Premium
                    </h1>
                    <p className="text-lg mb-8 w-[50%] text-wrap hidden md:block">
                        Entertainment Redefined - The best of Hollywood, Before TV
                        premieres, Blockbuster movies, Exclusive series, India{`'`}s biggest
                        Kids & Family hub + 365 days of reality!
                    </p>
                    <div className="flex flex-col md:flex-row w-full md:gap-8 gap-2">
                        {offers.map((offer, index) => (
                            <SpecialOfferCard
                                key={index}
                                title={offer.title}
                                features={offer.features}
                                price={offer.price}
                                originalPrice={offer.originalPrice}
                                discountLabel={offer.discountLabel}
                                duration={offer.duration}
                                isActive={activePrice === offer.price}
                                onClick={() => setActivePrice(offer.price)}
                            />
                        ))}
                    </div>
                    <button
                        className="bg-pink-600 p-3 md:mt-10 item-start flex font-medium rounded-lg ml-2"
                        onClick={handlePaymentButton}
                    >
                        Continue & Pay
                    </button>
                </div>
    </div>
  )
}

export default Page
