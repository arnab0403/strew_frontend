"use client"
import React, { useEffect, useState, ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { userLoggedInDetails } from '@/redux/userSlice'
import { api, ENDPOINT } from '@/lib/endpoint'
import { LoaderCircle } from 'lucide-react'

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
      <div className='h-[100vh] w-[100vw] flex items-center justify-center text-white'>
        <LoaderCircle className='animate-spin' size={70}/>
      </div>
    );
  }

  return <>{children}</>;
}

export default InitialLoad;
