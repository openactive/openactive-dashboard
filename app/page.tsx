import { DataExplorerSection } from "./components/DataExplorerSection";
import { FeedQualityFilterProvider } from "./components/FeedQualityFilterProvider";
import { FeedQualitySection } from "./components/feed-quality/FeedQualitySection";
import { HeroSection } from "./components/HeroSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      {/* The explorer publishes its current search into this provider and the
          Feed Quality section below reads it, so the two stay in step. */}
      <FeedQualityFilterProvider>
        <DataExplorerSection />
        <FeedQualitySection />
      </FeedQualityFilterProvider>
    </div>
  );
}
