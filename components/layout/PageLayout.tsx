import { Suspense } from "react";
import TabBar from "./TabBar";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F0EEFF]">
      <div className="max-w-lg mx-auto min-h-screen bg-[#F8F7FF] shadow-sm relative">
        {children}
      </div>
      <Suspense fallback={null}>
        <TabBar />
      </Suspense>
    </div>
  );
}