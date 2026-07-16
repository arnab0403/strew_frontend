import { cn } from '@/lib/utils'
import React from 'react'

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-[#4b4b4b]", className)}>

    </div>
  )
}

export default Skeleton
