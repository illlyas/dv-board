import { Suspense } from "react";
import { FullscreenDashboard } from "./fullscreen-dashboard";

export default function ProjectFullscreenDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-screen items-center justify-center bg-gray-950">
          <span className="h-8 w-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <FullscreenDashboard />
    </Suspense>
  );
}
