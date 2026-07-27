import VerificationStatus from "../../components/VerificationStatus";

export default function VerificationPage() {
  return (
    <main className="flex-1 w-full min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto flex justify-center items-stretch">
        <VerificationStatus />
      </div>
    </main>
  );
}
