import { getUrlDetails, media } from "@/lib/endpoint";
import { InboxIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SearchThumbnailProps {
  data: any[];
  setOpen: (open: boolean) => void;
  setMovieName: (name: string) => void;
}

function SearchThumbnail({ data, setOpen, setMovieName }: SearchThumbnailProps) {
  const router = useRouter();
  const urlRedirect = (id: string | number, type: string) => {
    const url = getUrlDetails(id, type);
    router.push(url);
    setOpen(false);
    setMovieName("");
  }

  if (!data || data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-[300px] py-12">
            <InboxIcon
                className="w-32 h-32 text-slate-400 mb-10"
                strokeWidth={1.2}
            />
            <p className="text-lg text-gray-500">No items found.</p>
        </div>
    );
  }
  return (
    <div className='flex gap-4 w-full overflow-scroll scrollbar-hide py-5'>
            {data.map((vid: any) => (
                <div onClick={() => urlRedirect(vid.id, vid.media_type)} key={vid.id} className="flex">
                  <Image alt='image' height={300} width={200} className='min-w-[150px] max-h-[250px] rounded-lg object-cover cursor-pointer' src={media(vid.poster_path, "xyz")} quality={30} />
                </div>
            ))}        
    </div>
  )
}

export default SearchThumbnail;
