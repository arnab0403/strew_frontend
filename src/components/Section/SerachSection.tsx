import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Skeleton from "@/components/atom/Skeleton"
import { useEffect, useState, ChangeEvent } from "react"
import { api, ENDPOINT } from "@/lib/endpoint"
import SearchThumbnail from "../atom/SearchThumbnail"
import { NavLabel, navIconClass, navIconIdle } from "../atom/NavItem"

export function SearchSection() {
  const [open, setOpen] = useState(false);
  const [movieName, setMovieName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMovieName(e.target.value);
  }

  useEffect(() => {
    setIsLoading(true);
    const fetchSearchMovie = async () => {
      if (!movieName) {
        setIsLoading(false);
        return;
      }
      console.log(movieName);
      try {
        const movie = await api.get(ENDPOINT.searchAllMovies(movieName));
        setData(movie.data.media);
        console.log(movie.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    const movieTimeOut = setTimeout(() => {
      fetchSearchMovie();
    }, 2000);

    return () => clearTimeout(movieTimeOut);
  }, [movieName]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="lg:w-full">
        <DialogTrigger asChild>
           <button type="button" aria-label="Search" className={`${navIconClass} ${navIconIdle} cursor-pointer`}>
                <Search className="size-5" strokeWidth={1.75} />
                <NavLabel label="Search" />
            </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[855px] border-none text-white">
          <DialogHeader>
            <DialogTitle>Search Anytime</DialogTitle>
          </DialogHeader>
          <Input 
              className=""
              placeholder="F1 The Movie" 
              value={movieName}
              onChange={(e) => { handleInputChange(e) }} 
          />
            {isLoading ? 
            (
              <div className="w-full flex justify-center gap-4 p-5 overflow-scroll scrollbar-hide">
                <Skeleton className="min-w-[150px] h-[200px] rounded-2xl"/>
                <Skeleton className="min-w-[150px] h-[200px] rounded-2xl"/>
                <Skeleton className="min-w-[150px] h-[200px] rounded-2xl"/>
                <Skeleton className="min-w-[150px] h-[200px] rounded-2xl"/>
                <Skeleton className="min-w-[150px] h-[200px] rounded-2xl"/>
                <Skeleton className="min-w-[150px] h-[200px] rounded-2xl"/>
              </div>
            )
            :  
            (
              <SearchThumbnail data={data} setOpen={setOpen} setMovieName={setMovieName}/>
            )
            }
        </DialogContent>
      </div>
    </Dialog>
  )
}
