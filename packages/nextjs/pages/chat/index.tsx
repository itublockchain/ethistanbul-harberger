import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <>
      <div className="w-full flex flex-col h-[760px] justify-end gap-3">
        <div className="px-48">
            Deneme
        </div>
        <div className="w-full flex focus:outline-none gap-6 justify-center items-center">
          <input
            className="flex gap-5 rounded-xl w-3/4 h-16 bg-white input-box px-4 text-[20px]"
            onChange={(e) => setMessage(e.currentTarget.value)}
          ></input>
          <button className="w-[150px] h-[70px] bg-[#3DB9CF] rounded-xl">
            Send
          </button>
        </div>
      </div>
    </>
  );
}
