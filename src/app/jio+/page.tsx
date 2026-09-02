"use client";

import { api, ENDPOINT, getStreamingVideoThumbnail } from "@/lib/endpoint";
import { FolderLockIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Skeleton from "@/components/atom/Skeleton";
import Image from "next/image";
import { RootState } from "@/redux/store";

function WatchList() {    
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: RootState) => state.user);
    
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                const response = await api.get(ENDPOINT.fetchAllStreamingVideos);
                if (response.data.videos && response.data.videos.length > 0) {
                  setData(response.data.videos);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []); // Only re-fetch when login status changes

    console.log("Watchlist rendering");

    return (
        <div className="mt-[75px]">
            {user.isLoggedIn ? (
                loading ? (
                    <CategorySectionFallback />
                ) : (
                    <CategorySectionData data={data} />
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-[100vh] -mt-[75px] w-full gap-4">
                    <FolderLockIcon
                        className="w-32 h-32 text-slate-400"
                        strokeWidth={1.2}
                    />
                    <p className="text-base text-slate-400">
                        Login to watch premium contents
                    </p>
                    <Link href={"/login"} className="rounded-full px-6 py-2 mt-4 bg-pink-600 text-white">Login</Link>
                </div>
            )}
        </div>
    );
}

function CategorySectionData({ data }: { data: any[] | null }) {
    if (!data || data.length === 0) {
        return (
            <div className="py-8 px-6 bg-[#0c0a09] text-[white]">
                <h2 className="text-2xl font-medium mb-6">Watchlist</h2>
                <div>No items in your watchlist</div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 bg-[#0c0a09] text-[white]">
            <h2 className="text-2xl font-medium mb-6">Watchlist</h2>
            <div className='flex gap-4 w-full overflow-scroll scrollbar-hide'>
                {data.map((vid) => (
                    <Link href={`/jio+/watch?name=${vid.name}`} key={vid.name}>
                        <Image 
                            alt='image'  
                            height={300} 
                            width={200}
                            className='min-w-[200px] h-[300px] rounded-lg object-cover cursor-pointer' 
                            src={getStreamingVideoThumbnail(vid.name)}
                            quality={30}
                        />
                    </Link>
                ))}        
            </div>
        </div>
    );
}

function CategorySectionFallback() {
    return (
        <div className="py-8 px-6 bg-[#0c0a09] text-[white]">
            <h2 className="text-2xl font-medium mb-6">Watchlist</h2>
            <div className='flex gap-4 w-full overflow-scroll scrollbar-hide'>
                {new Array(16).fill(0).map((_, index) => (
                    <Skeleton key={index} className='min-w-[200px] h-[300px] rounded-lg'/>
                ))}
            </div>
        </div>
    );
}

export default WatchList;
