"use client";

import Image from "next/image";
import logo from "@/public/logo.png";
import { ReaderInfo } from "@/lib/ReaderInfo";
import Link from "next/link";

const Navbar = () => {
    const { User } = ReaderInfo();

    return (
        <nav className="fixed top-0 left-0 z-20 w-full border-b border-black/10 bg-[#FAF9F6]">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-6 py-4 lg:px-10">

                {/* Brand */}
                <div className="flex items-center gap-3">
                    <Image
                        width={150}
                        height={150}
                        src={logo}
                        className="h-9 w-auto"
                        alt="Deciding Now Logo"
                    />

                    <Link
                        href="/"
                        className="font-serif text-2xl font-bold tracking-tight text-[#20201E]"
                    >
                        Deciding Now.
                    </Link>
                </div>

                {/* Authentication */}
                <div className="flex items-center gap-3 md:order-2">
                    {User ? (
                        <button
                            type="button"
                            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium text-[#20201E] transition-colors hover:bg-black/5"
                        >
                            Hi {User}!
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-[#20201E] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                        >
                            Log in
                        </Link>
                    )}

                    {/* Mobile menu button */}
                    <button
                        data-collapse-toggle="navbar-sticky"
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#20201E] hover:bg-black/5 md:hidden"
                        aria-controls="navbar-sticky"
                        aria-expanded="false"
                    >
                        <span className="sr-only">
                            Open main menu
                        </span>

                        <svg
                            className="h-6 w-6"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M4 7h16M4 12h16M4 17h16"
                            />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div
                    className="hidden w-full md:order-1 md:flex md:w-auto"
                    id="navbar-sticky"
                >
                    <ul className="mt-4 flex flex-col gap-5 border-t border-black/10 pt-4 text-sm font-medium md:mt-0 md:flex-row md:items-center md:gap-8 md:border-0 md:pt-0">

                        <li>
                            <a
                                href="#"
                                className="border-b border-[#20201E] pb-1 text-[#20201E]"
                                aria-current="page"
                            >
                                Home
                            </a>
                        </li>

                        <li>
                            <a
                                href="#"
                                className="text-neutral-500 transition-colors hover:text-black"
                            >
                                Biology
                            </a>
                        </li>

                        <li>
                            <a
                                href="#"
                                className="text-neutral-500 transition-colors hover:text-black"
                            >
                                Chemistry
                            </a>
                        </li>

                        <li>
                            <Link
                                href="/post"
                                className="flex items-center gap-2 text-neutral-500 transition-colors hover:text-black"
                            >
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="m16 3 5 5-12 12-6 1 1-6Z" />
                                    <path d="m14 5 5 5" />
                                </svg>
                                Write
                            </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;