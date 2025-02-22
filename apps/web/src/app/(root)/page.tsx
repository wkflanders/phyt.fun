import { CompetitionMast } from "@/components/Competitions/CompetitionMast";
import { Feed } from "@/components/Feed/Feed";

export default function Home() {
  return (
    <div className="flex flex-1 gap-4">
      <CompetitionMast />
      <Feed />
    </div>
  );
}