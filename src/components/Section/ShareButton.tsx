"use client"

import { Share2 } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'


function ShareButton() {
    const handleShare = () => {
        const url = window.location.href;
        
        navigator.clipboard.writeText(url)
        .then(() => {
            alert("URL Copies To Clipboard :)");
        }).catch(() => {
            alert("Failed to copy the URL..!");
        })
    }
  return (
    <Button className="bg-[#e11d48] hover:bg-[#cd0b35] cursor-pointer h-10" onClick={handleShare}> 
        <Share2/> Share
    </Button>
  )
}

export default ShareButton
