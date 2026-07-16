"use client"

import React, { useState, useEffect, ChangeEvent } from 'react'
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
import { toast } from "sonner"
import Link from 'next/link'
import { api, ENDPOINT } from '@/lib/endpoint'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { RootState } from '@/redux/store'

function Signup() {
    const [loading, setLoading] = useState(false);
    const [userObject, setUserObject] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (user.isLoggedIn) {
            router.push("/");
        }
    }, [user.isLoggedIn, router])

    const handleSubmit = async () => {
        setLoading(true);
        console.log(userObject)
        if (!userObject.name || !userObject.confirmPassword || !userObject.password || !userObject.email) {
            setLoading(false);
            return toast("Please fill all the fields before Sign Up..!");
        }
        if (userObject.confirmPassword !== userObject.password) {
            setLoading(false);
            return toast.warning("Password and Confirm Password should be same")
        }

        
        try {
            const name = userObject.name;
            const email = userObject.email;
            const password = userObject.password;
            const response = await api.post(ENDPOINT.signup, {
                name, email, password
            });

            if (response.data.status === "failed") {
                toast.warning(response.data.message);
            } else if (response.data.status === "success") {
                router.push("/");
            }
            setLoading(false);
        } catch (error: any) {
            // Axios throws here if status != 200
            if (error.response) {
                toast.warning(error.response.data.message || "User already exists!");
            } else {
                toast.error("Something went wrong. Please try again later.");
            }
            setLoading(false);
        } finally {
            setLoading(false);
        }
   
    }
    

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        setUserObject(userObject => ({
            ...userObject,
            [e.target.id]: e.target.value
        }));
    }
  return (
    
    <div className='h-[100vh] flex justify-center items-center'>
        <Card className="w-full max-w-sm bg-[#1c1917] border border-[#313131] text-white rounded-sm">
        <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
            Enter your information to create an account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div>
                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your Name"
                            value={userObject.name}
                            required
                            onChange={handleInput}
                            />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={userObject.email}
                            required
                            onChange={handleInput}
                            />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={userObject.password}
                            onChange={handleInput}
                            required
                            />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={userObject.confirmPassword}
                            onChange={handleInput}
                            required
                        />
                </div>
            </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full bg-[#e11d48] hover:bg-[#cb143c] cursor-pointer" onClick={handleSubmit}>
                {!loading ? "Sign Up" : <LoaderCircle className='animate-spin'/>}
            </Button>
        <div className='w-full flex flex-row justify-center text-sm pt-2'>
            <div className='flex gap-1'>
                <p>
                    Already have an account? 
                </p>
                <Link href="/login" className=' underline'>
                    Sign Up
                </Link>
            </div>
        </div>
        </CardFooter>
        </Card>
    </div>
  )
}

export default Signup
