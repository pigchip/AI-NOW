import Image from "next/image"

export const Loader = () => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center ">
      <div className="w-10 h-10 relative animate-pulse ">
        <Image
          alt="Logo"
          src="/logo.png"
          fill
        />
      </div>
      <p className="text-sm text-white animate-pulse ">
        AI-NOW is thinking...
      </p>
    </div>
  );
};