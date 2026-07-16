import { Ghost } from 'lucide-react'
import React from 'react'

function Error() {
  return (
    <div className='text-[#9c9c9c] h-[100vh] flex justify-center items-center flex-col gap-4 '>
        <Ghost size={140} strokeWidth={1} className='animate-bounce'/>
        <h1 className='text-6xl font-extrabold text-[#e2e2e2]'>404</h1>
        <p>Page Not Found</p>
    </div>
  )
}

export default Error
