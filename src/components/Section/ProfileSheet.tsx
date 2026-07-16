import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navLinks } from "./Headers";
import { useDispatch, useSelector } from "react-redux";
import { api, ENDPOINT } from "@/lib/endpoint";
import { userLoggedOutDetails } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RootState } from "@/redux/store";

function ProfileSheet() {
    const [open, setOpen] = useState(false);

    // getting the state 
    const user = useSelector((state: RootState) => state.user) 
    console.log(user.user)
    const dispatch = useDispatch();
    const router = useRouter();

    // logout 
    const handleLogout = async () => {
      setOpen(false);
      try {
        const response = await api.post(ENDPOINT.logout);

        if (response.data.status === "success") {
          dispatch(userLoggedOutDetails());
          router.push("/login");
        }
        
      } catch (error) {
        toast.success("There is something error");
      }
    }
    
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="cursor-pointer">
          {user.isLoggedIn ? 
          (
          <div className="ml-4 h-10 w-10 rounded-full overflow-hidden bg-[#009fe3] text-white flex justify-center items-center text-2xl">
            {
            user.user?.avatar ? 
            <Image height={40} width={40} alt="User Image" src={user.user.avatar}/> 
              :  
            <p>
              {user.user?.name?.charAt(0) || "U"}
            </p>
            }
          </div>
          ) 
          : 
          (<Image
              src="/profile.avif"
              alt="Profile Icon"
              className="ml-4 min-h-10 min-w-10 rounded-full"
              width={40}
              height={40}
          />)}
      </SheetTrigger>
      <SheetContent className="px-6 bg-[#0c0a09] text-white border-[#313131]">
       <SheetTitle>Are you absolutely sure?</SheetTitle>
        <div className="bg-slate-700/30 p-6 flex flex-col items-center gap-2 mt-[80px] rounded-lg">
            {user.isLoggedIn ? 
            (
            <div className=" h-[100px] w-[100px] -mt-[60px] rounded-full text-5xl overflow-hidden  bg-[#009fe3] text-white flex justify-center items-center ">
              {user.user?.avatar ? 
              <Image height={100} width={100} alt="User Image" src={user.user.avatar}/> 
              : 
              <p>
                {user.user?.name?.charAt(0) || "U"}  
              </p> 
              }
            </div>
            ) : (
            <Image
                src="/profile.avif"
                alt="Profile Icon"
                className="h-[100px] w-[100px] rounded-full -mt-[60px]"
                width={40}
                height={40}
            />
            )}
            
            <p className="text-xl font-bold capitalize">
               {user.user?.name?.split(" ")[0] || 'Guest'}
            </p>
            {user.isLoggedIn ? (
            <Button
                className="rounded-full cursor-pointer font-medium mt-4 text-base px-4 py-2 bg-pink-600 hover:bg-pink-700"
                onClick={handleLogout}
            >
                Logout
            </Button> 
            ) : (
            <Link
                href={"/login"}
                className="rounded-full cursor-pointer font-medium mt-4 text-base px-4 py-2 bg-pink-600 hover:bg-pink-700"
                onClick={() => setOpen(false)}
            >
                Login
            </Link>
            )}
        </div>
        <div className="my-2">
          {user.user?.isPremium ? 
          <div 
            className="flex items-center justify-between px-2 py-4 text-sm border-b border-[#313131] cursor-pointer"
          >
            <p>
              Premium
            </p>
            <ChevronRightIcon className="w-6 h-6" />
          </div> 
          :
          <Link 
            href="/subscription" 
            className="flex items-center justify-between px-2 py-4 text-sm border-b border-[#313131] cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <p>
              Subscribe Now
            </p>
            <ChevronRightIcon className="w-6 h-6" />
          </Link>
          }
          
          {navLinks.map((item) => (
            <Link
              className="flex items-center justify-between px-2 py-4 text-sm"
              href={item.href}
              key={item.key}
              onClick={() => setOpen(false)}
            >
              <p>
                {item.name}
              </p>
              <ExternalLinkIcon className="w-4 h-4" />
            </Link>
          ))}
          <Link 
            href="/subscription" 
            className="flex items-center justify-between px-2 py-4 text-sm border-t border-[#313131]"
            onClick={() => setOpen(false)}
          >
            <p>
              Help and Legal
            </p>
            <ChevronRightIcon className="w-6 h-6" />
          </Link>

        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ProfileSheet;
