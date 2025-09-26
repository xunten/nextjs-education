import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Loading() {
  return (
    <div>
      <div className="container mx-auto p-6 h-52 flex justify-center items-center">
        <DotLottieReact src="/animations/loading.lottie" loop autoplay />
      </div>
    </div>
  );
}
