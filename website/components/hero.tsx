"use client";

import Image from "next/image";
import com from "@/public/main.webp";

const Hero = () => {
    return (
        <section
            id="single-image-hero"
            className="relative mt-17 flex min-h-[calc(100svh-4.25rem)] items-center justify-center overflow-hidden"
        >
            <Image
                src={com}
                fill
                className="object-cover"
                alt="Hero Banner"
                priority
                sizes="100vw"
            />

            <div className="absolute inset-0 bg-black/40" />

            <h1 className="relative z-10 max-w-5xl px-6 text-center font-serif text-5xl font-normal leading-tight tracking-tight text-[#FAF9F6] sm:text-7xl lg:text-8xl">
                The spirit of <br />
                <span className="italic">polymathism</span> lives on.
            </h1>
        </section>
    );
};

export default Hero;