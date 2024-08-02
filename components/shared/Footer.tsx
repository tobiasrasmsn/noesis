"use client";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-zinc-800 text-white py-8">
            <div className="flex flex-col items-center justify-between md:flex-row px-12">
                <div className="flex flex-col items-center">
                    <div className="flex flex-row items-end justify-center">
                        <Link href="#" className="text-2xl font-medium leading-none" prefetch={false}>
                            Noesis{" "}
                        </Link>
                        <h3 className="text-xs font-normal text-zinc-400 leading-none"> / Cures boredom.</h3>
                    </div>

                    <Link
                        href={"https://buymeacoffee.com/tobiasr"}
                        className="text-[16.5px]  text-gray-400 duration-500 hover:scale-105 hover:text-zinc-100 drop-shadow-md hover:drop-shadow-[0_4px_14px_0_rgb(0,118,255,39%)]"
                    >
                        Made with <span className="animate-pulse">❤️‍🔥</span> by Tobias
                    </Link>
                </div>
                <nav className="flex items-center space-x-6 mt-4 md:mt-0">
                    <Link
                        href="/"
                        className="text-sm font-medium hover:text-gray-300 transition-colors"
                        prefetch={false}
                    >
                        Home
                    </Link>
                    <Link
                        href="https://www.aretestudio.no/"
                        className="text-sm font-medium hover:text-gray-300 transition-colors"
                        prefetch={false}
                    >
                        Need a website?
                    </Link>
                    <Link
                        href="https://buymeacoffee.com/tobiasr"
                        className="text-sm font-medium hover:text-gray-300 transition-colors"
                        prefetch={false}
                    >
                        Support me
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
