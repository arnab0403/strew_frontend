import { getUrlDetails, media } from '@/lib/endpoint'
import React, { Suspense } from 'react'
import Skeleton from '../../../atom/Skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';

interface BannerSectionProps {
  fetcher: () => Promise<any[]>;
}

async function BannerSection({ fetcher }: BannerSectionProps) {
  return (
    <Suspense fallback={<BannerSectionFallback />}>
      <BannerSectionContent fetcher={fetcher} />
    </Suspense>
  ) 
}

async function BannerSectionContent({ fetcher }: BannerSectionProps) {
  const data = await fetcher();
  return (
    <Carousel
      opts={{
        align: "center",
        loop: true
      }}
      className="w-full px-4 "
    >
      <CarouselContent className="">
        {data.map((vid: any) => (
          <CarouselItem key={vid.id} className="relative w-full max-w-[700px] h-[500px]  mx-2  rounded-2xl group cursor-pointer">
            <Link href={getUrlDetails(vid.id, vid.media_type)}>
              <Image
                src={media(vid.backdrop_path)}
                alt="poster"
                width={700}
                height={500}
                className="rounded-2xl object-cover min-w-full min-h-full bg-slate-600 "
                quality={25}
              />
              <div className="absolute bottom-0 left-0 w-full h-[30%] 
                              justify-center items-end pb-4
                              text-white text-[27px] 
                              bg-gradient-to-t from-black to-transparent
                              rounded-b-2xl 
                              hidden group-hover:flex transition-all duration-300">
                <p className="px-2 text-center">{vid.title}</p>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className=' absolute bottom-4 right-[12%] hidden md:flex text-white'>
        <CarouselPrevious className="border-none h-11 w-11" />
        <CarouselNext className="border-none h-11 w-11" />
      </div>
    </Carousel>
  )
}

function BannerSectionFallback() {
  return (
    <div className='flex justify-center items-center rounded-lg gap-8 bg-black overflow-hidden'>
      <Skeleton className="h-[500px] min-w-[684px] rounded-2xl " />
      <Skeleton className="h-[500px] min-w-[684px] rounded-2xl" />
      <Skeleton className="h-[500px] min-w-[684px] rounded-2xl" />
    </div>
  )
}

export default BannerSection
