
"use client";

import Image from 'next/image';

export default function HomePageImage() {
    return (
        <div 
            className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-2xl shadow-primary/20" 
            onContextMenu={(e) => e.preventDefault()}
        >
            <Image 
                src="https://res.cloudinary.com/dsukslmgr/image/upload/v1751520605/Gemini_Generated_Image_s1k7ess1k7ess1k7_xqxiuq.png" 
                alt="A magical open book with a whimsical castle and landscape emanating from its pages" 
                layout="fill" 
                objectFit="cover" 
                className="pointer-events-none"
            />
        </div>
    );
}
