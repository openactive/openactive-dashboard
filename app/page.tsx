import { DataExplorerSection } from "./components/DataExplorerSection";
import { FeedQualitySection } from "./components/feed-quality/FeedQualitySection";
import { HeroSection } from "./components/HeroSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <DataExplorerSection />
      <FeedQualitySection />
    </div>
  );
}
