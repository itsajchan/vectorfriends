"use client";

import Image from "next/image";
import Link from "next/link";
import Spline from '@splinetool/react-spline';

export default function Home() {
  return (
    <div className="min-h-screen min-w-full p-10 bg-gradient-radial from-sky-200 via-purple-200 to-teal-200 flex items-center justify-center">
      <div className="flex flex-col">

        <h1 className="text-center text-6xl mt-10">
          Making Friends with Weaviate Vector Search
        </h1>
        <div className="flex justify-center pt-10">

          <Link href="/make-friends" className="bg-yellow-100 rounded px-4 py-3 hover:bg-yellow-200">Get Started</Link>
        </div>

        <div className="mr-20" >

          <Spline scene="https://prod.spline.design/ITDkMG3oMx7xK0fp/scene.splinecode" />

        </div>
        </div>
    </div>
  );
}