"use client"
import React, { useEffect, useState, ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { userLoggedInDetails } from '@/redux/userSlice'
import { api, ENDPOINT } from '@/lib/endpoint'
import Skeleton from '@/components/atom/Skeleton'

interface InitialLoadProps {
  children: ReactNode;
}

function InitialLoad({ children }: InitialLoadProps) {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  console.log("Intial Load Render");
  const fetchUserDetails = async () => {
    try {
      const response = await api.get(ENDPOINT.user);
      console.log(response);

      if (response.data.status === "success") {
        dispatch(userLoggedInDetails(response.data.user));
      }
    } catch (error) {
      setIsLoading(false)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (isLoading) {
    return (
      <div className='min-h-screen w-full overflow-hidden bg-[#0c0a09] pt-[64px] lg:pl-[76px] lg:pt-0'>
        <div className='flex gap-4 p-6'>
          {new Array(3).fill(0).map((_, index) => (
            <Skeleton key={index} className='h-9 w-24 shrink-0 rounded-full' />
          ))}
        </div>

        <div className='flex items-center justify-center gap-8 overflow-hidden px-4'>
          {new Array(3).fill(0).map((_, index) => (
            <Skeleton key={index} className='h-[500px] min-w-[684px] rounded-2xl' />
          ))}
        </div>

        {new Array(3).fill(0).map((_, sectionIndex) => (
          <div key={sectionIndex} className='bg-[#0c0a09] px-6 py-8'>
            <Skeleton className='mb-6 h-8 w-32 rounded-md' />
            <div className='flex w-full gap-4 overflow-hidden'>
              {new Array(16).fill(0).map((_, cardIndex) => (
                <Skeleton
                  key={cardIndex}
                  className='h-[300px] min-w-[200px] rounded-lg'
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <>{children}</>;
}

export default InitialLoad;
