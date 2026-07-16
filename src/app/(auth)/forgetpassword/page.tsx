"use client"

import React, { useState, ChangeEvent } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api, ENDPOINT } from '@/lib/endpoint'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

function Page() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const [dialogBox, setDialogBox] = useState(false);


    const handleForgetPassword = async () => {
        try {
            const response = await api.post(ENDPOINT.forgetpassword, { email });
            if (response.data.status === "success") {
                toast("OTP send successfully");
                setDialogBox(true);
            } else {
                toast("Email ID not Exist");
            }
        } catch (error: any) {
            toast(error.response?.data?.message || "Something went wrong");
        }

    }

    const handleResetPassword = async () => {
        if (!otp) {
            return toast("OTP required")
        }
        if (password.length < 8) {
            return toast("Password length should be 8 characters");
        }
        if (!password) {
            return toast("New password required");
        }
        if (password !== confirmPassword) {
            return toast("New password and confrim password are not same")
        }

        try {
            const response = await api.post(ENDPOINT.resetPassword, { email, otp, password });
            if (response.data.status === "success") {
                toast("Password changed succsessfully");
                router.push("/login");
            } else {
                toast("Wrong OTP");
            }
        } catch (error: any) {
            toast(error.response?.data?.message || "Something went wrong");
        }
    }


    const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!isNaN(val as any)) {
            setOtp(val);
        }
    }

  return (
    <>
        <div className='h-[100vh] flex justify-center items-center'>
        {!dialogBox ?
            <Card className="w-full max-w-sm bg-[#1c1917]  border border-[#313131] text-white rounded-sm">
            <CardHeader>
                <CardTitle className="text-lg">Forgot Password / Reset Password</CardTitle>
                <CardDescription className="text-[#999999]">
                Enter your email to get OTP
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
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full bg-[#e11d48] hover:bg-[#cb143c] cursor-pointer" onClick={handleForgetPassword}>
                    Send OTP
                </Button>
            </CardFooter>
            </Card>
        :
        <Dialog open={dialogBox} onOpenChange={() => setDialogBox(false)}> 
            <div>
                <DialogContent className="sm:max-w-[425px] text-white border-[#2d2d2d]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input 
                        id="otp" 
                        name="otp" 
                        placeholder="Enter OTP"
                        value={otp} 
                        onChange={handleOtpChange}
                    />
                    </div>
                    <div className="grid gap-3">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                        id="newPassword" 
                        type="password"
                        name="newPassword" 
                        placeholder="Enter New Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                    <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password"
                        placeholder="Enter Confirm Password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full bg-[#e11d48] hover:bg-[#cb143c] cursor-pointer" onClick={handleResetPassword}>Reset</Button>
                </DialogFooter>
                </DialogContent>
            </div>
        </Dialog>
        }
        </div>
    </>
  )
}

export default Page
