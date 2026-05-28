import { DataExplorerSection } from "./components/DataExplorerSection";
import { HeroSection } from "./components/HeroSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <DataExplorerSection />
    </div>
  );
}
