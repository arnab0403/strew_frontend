import React, { Suspense } from 'react'
import Skeleton from '../../../atom/Skeleton'
import { getUrlDetails, media } from '@/lib/endpoint'
import Image from 'next/image';
import Link from 'next/link';
import { InboxIcon } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  id: string;
  fetcher: () => Promise<any[]>;
}

function CategorySection({ title, id, fetcher }: CategorySectionProps) {
  return (
    <div className='py-8 px-6 bg-[#0c0a09] text-[white]'>
        <h2 id={id} className='text-2xl font-medium mb-6 scroll-m-[100px]'>
            {title}
        </h2>
      <Suspense fallback={<CategorySectionFallback />}>
        <CategorySectionData fetcher={fetcher} />
      </Suspense> 
    </div>
  )
}

async function CategorySectionData({ fetcher }: { fetcher: () => Promise<any[]> }) {
  const data = await fetcher();

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
    <div className='flex gap-4 w-full overflow-scroll scrollbar-hide'>
            {data.map((vid: any) => (
                <Link href={getUrlDetails(vid.id, vid.media_type)} key={vid.id}>
                  <Image alt='image' height={300} width={200} className='min-w-[200px] h-[300px] rounded-lg object-cover cursor-pointer' src={media(vid.poster_path)} quality={30} />
                </Link>
            ))}        
    </div>
  )
}

function CategorySectionFallback() {
  return (
    <div className='flex gap-4 w-full overflow-scroll scrollbar-hide'>
          {new Array(16).fill(0).map((e, index) => (
              <Skeleton key={index} className='min-w-[200px] h-[300px] rounded-lg' />
          ))}
    </div>
  )
}

export default CategorySection
