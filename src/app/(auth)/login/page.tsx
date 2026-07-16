"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { api, API_BASE_URL, ENDPOINT } from '@/lib/endpoint'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { userLoggedInDetails } from '@/redux/userSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { LoaderCircle } from 'lucide-react'
import { RootState } from '@/redux/store'

function Login() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const router = useRouter();
    
    // checking if any errors are there 
    useEffect(() => {  
        const error = searchParams.get("error") || "";
        if (error === "manual_account") {
            toast("Please login with email ID & Password");
        }

        if (user.isLoggedIn) {
            router.push("/");
        }
    }, [user.isLoggedIn, router, searchParams])
    
    // custom login handler
    const handleSubmit = async () => {
        setLoading(true);
        if (!email || !password) {
            setLoading(false);
            return toast.warning("All fields are required");
        }
        
        try {
            const response = await api.post(ENDPOINT.login, { email, password });
            if (response.data.status === "success") {
                dispatch(userLoggedInDetails(response.data.user));
                router.push("/"); 
            }
            setLoading(false);
        } catch (error: any) {
            // Axios throws here if status != 200
            if (error.response) {
                toast.warning(error.response.data.message || "Email Not Found..!");
            } else {
                toast.error("Something went wrong. Please try again later.");
            }
            setLoading(false);
        }
    }
  return (
    <div className='h-[100vh] flex justify-center items-center'>
            <Card className="w-full max-w-sm bg-[#1c1917]  border border-[#313131] text-white rounded-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login </CardTitle>
                    <CardDescription className="text-[#999999]">
                    Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
            <CardContent>
                <div>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full bg-[#e11d48] hover:bg-[#cb143c] cursor-pointer" onClick={handleSubmit}>
                    {loading ? <LoaderCircle className='animate-spin'/> : "Sign In"}
                </Button>

                <Button className="w-full bg-[white] hover:bg-[#cfcfcf] cursor-pointer" onClick={() => { window.open(`${API_BASE_URL}/auth/google`, "_self") }}>
                    <Image src="/google.png" height={20} width={20} alt='google'/>
                </Button>
            <div className='w-full flex flex-row justify-between text-sm pt-6'>
                <div>
                    <Link href="forgetpassword">
                        Forget Password?
                    </Link>
                </div>
                <div className='flex gap-1'>
                    <p>Need an account? </p>
                     <Link href="/signup" className=' underline'>
                        Sign Up
                    </Link>
                </div>
            </div>
            </CardFooter>
            </Card>
        </div>
  )
}

export default Login
