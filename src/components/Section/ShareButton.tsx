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
    <Button className="bg-brand text-brand-foreground hover:bg-brand-hover cursor-pointer h-10" onClick={handleShare}> 
        <Share2/> Share
    </Button>
  )
}

export default ShareButton
