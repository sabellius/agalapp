import { BrowseByRegion } from "@/components/home/browse-by-region";
import { HeroSection } from "@/components/home/hero-section";
import { PopularTrucks } from "@/components/home/popular-trucks";
import { RecentTrucks } from "@/components/home/recent-trucks";
import { SectionHeading } from "@/components/home/section-heading";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-12">
        <SectionHeading>הכי פופולרי</SectionHeading>
        <PopularTrucks />

        <SectionHeading>גלו לפי אזור</SectionHeading>
        <BrowseByRegion />

        <SectionHeading>נוספו לאחרונה</SectionHeading>
        <RecentTrucks />
      </div>
    </div>
  );
}
