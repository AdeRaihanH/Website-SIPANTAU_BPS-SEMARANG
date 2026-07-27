"use client";

import { useState, useEffect } from "react";
import ShowcaseCarousel from "../components/ShowcaseCarousel";
import AuthForm from "../components/AuthForm";

export default function Home() {
  const [hideCarousel, setHideCarousel] = useState(false);
  const [mobileMode, setMobileMode] = useState("carousel");
  const [initialSignUp, setInitialSignUp] = useState(false);

  // Listen to native phone back button / swipe back gesture
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.mobileMode === "form") {
        setMobileMode("form");
        if (typeof e.state.initialSignUp === "boolean") {
          setInitialSignUp(e.state.initialSignUp);
        }
      } else {
        setMobileMode("carousel");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectSignUp = () => {
    setInitialSignUp(true);
    setMobileMode("form");
    if (typeof window !== "undefined") {
      window.history.pushState({ mobileMode: "form", initialSignUp: true }, "");
    }
  };

  const handleSelectSignIn = () => {
    setInitialSignUp(false);
    setMobileMode("form");
    if (typeof window !== "undefined") {
      window.history.pushState({ mobileMode: "form", initialSignUp: false }, "");
    }
  };

  return (
    <main className="flex-1 w-full min-h-screen bg-[#f4f4f5] flex items-center justify-center p-0 md:px-4 md:py-6 sm:px-6 lg:px-8">
      {/* Desktop Layout (>= md): Side-by-side Showcase & Form */}
      <div className="hidden md:flex w-full max-w-6xl flex-row items-stretch justify-center gap-6 md:gap-10">
        {!hideCarousel && (
          <div className="w-1/2 flex justify-center order-1 items-stretch">
            <ShowcaseCarousel />
          </div>
        )}
        <div className={`${hideCarousel ? 'max-w-md mx-auto' : 'w-1/2'} flex justify-center order-2 items-stretch`}>
          <AuthForm onForgotPasswordChange={setHideCarousel} />
        </div>
      </div>

      {/* Mobile Layout (< md): Fullscreen Onboarding Carousel OR Auth Form */}
      <div className="flex md:hidden w-full min-h-screen flex-col items-center justify-center">
        {mobileMode === "carousel" && !hideCarousel ? (
          <ShowcaseCarousel
            onSelectSignUp={handleSelectSignUp}
            onSelectSignIn={handleSelectSignIn}
            isMobileFullScreen={true}
          />
        ) : (
          <div className="w-full min-h-screen px-4 py-8 flex items-center justify-center bg-[#f4f4f5]">
            <AuthForm
              onForgotPasswordChange={setHideCarousel}
              initialSignUp={initialSignUp}
            />
          </div>
        )}
      </div>
    </main>
  );
}
