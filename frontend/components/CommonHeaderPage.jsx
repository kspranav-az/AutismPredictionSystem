"use client";
import Image from "next/image";

export default function CommonHeaderPage() {
  return (
    <header className="bg-white text-black shadow-lg py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <a href="/home">
          <img
            src="./images/aimed_logo.jpg"
            alt="AIMED"
            width={80}
            height={80}
            className="mr-2 rounded-2xl"
          />
        </a>
      </div>

      <div className="flex h-10 w-fit flex-col  items-center   text-black  ">
        <h1 className="text-2xl font-semibold sm:hidden ">AIMED</h1>
        <h1 className="text-2xl font-semibold invisible sm:visible ">
          Autism Identification through Multimodal Early Detection
        </h1>
      </div>

      <div className="flex items-center">
        <div className="flex flex-row items-center border  rounded-full border-black overflow-hidden">
          <button
            className="bg-gray-100 text-black px-4 py-2  hover:bg-gray-200 border-r border-gray-300"
            onClick={() => alert("Profile clicked")}
          >
            Profile
          </button>
          <button
            className="bg-gray-100 text-black px-4 py-2 hover:bg-gray-200"
            onClick={() => alert("Logout clicked")}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
