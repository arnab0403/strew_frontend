"use client"

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Button } from '../ui/button';
import { LoaderCircle, PlusIcon } from 'lucide-react';
import { api, ENDPOINT } from '@/lib/endpoint';
import { toast } from 'sonner';
import { RootState } from '@/redux/store';

interface WatchListButtonProps {
    watchList: any;
}

function WatchListButton({ watchList }: WatchListButtonProps) {
    const user = useSelector((state: RootState) => state.user);
    const [isLoading, setLoading] = useState(false);
    const addToWatchList = async () => {
        try {
            setLoading(true);
            const response = await api.post(ENDPOINT.addToWishlist, watchList);
            if (response.data.status === "success") {
                toast.success("Added to Watch List")
            }
        } catch (error: any) {
            toast.warning(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    if (!user.isLoggedIn) {
        return null;
    }
  return (
    <Button className={`bg-brand text-brand-foreground hover:bg-brand-hover h-10 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={addToWatchList}>
        {isLoading ? <LoaderCircle className=' animate-spin'/> : <PlusIcon className='w-4 h-4'/>}
        WatchList
    </Button>
  )
}

export default WatchListButton
