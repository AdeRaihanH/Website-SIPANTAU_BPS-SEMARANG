import ShowcaseCarousel from "../components/ShowcaseCarousel";
import AuthForm from "../components/AuthForm";

export default function Home() {
  return (
    <main className="flex-1 w-full min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-10">
        {/* Left Column: Product Showcase Carousel */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1 items-stretch">
          <ShowcaseCarousel />
        </div>

        {/* Right Column: Auth Forms (Sign In & Sign Up) */}
        <div className="w-full md:w-1/2 flex justify-center order-1 md:order-2 items-stretch">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}


