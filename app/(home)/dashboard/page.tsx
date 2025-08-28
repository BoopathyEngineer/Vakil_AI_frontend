"use client";

export default function Page() {
  return (
    <div className="pt-12 flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Static gradient model */}
      <div
        className="text-white font-semibold py-2 px-5 rounded-full shadow-md inline-block"
        style={{
          background: "linear-gradient(to right, #8383F4, #B054E9)",
        }}
      >
        An AI Powered Legal Assistant
      </div>

      {/* Gradient Text for the heading */}
      <h1
        className="text-3xl md:text-5xl font-bold mt-5 text-center"
        style={{
          background: "linear-gradient(to right, #8383F4, #B054E9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Legal Research Smarter & Faster
      </h1>
    </div>
  );
}
