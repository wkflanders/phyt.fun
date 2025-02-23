import { CompetitionMast } from "@/components/Competitions/CompetitionMast";
import { Feed } from "@/components/Feed/Feed";

export default function Home() {
  return (
    <div className="flex flex-col w-full pt-16">
      <div className="w-full px-16">
        <CompetitionMast />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-16 mt-8">
        <div className="flex-1 lg:max-w-[65%]">
          <Feed />
        </div>

        <div className="w-full lg:w-[350px] shrink-0 bg-black/10 backdrop-blur-md rounded-xl border border-white/10 h-[500px] p-6">
          <h2 className="text-xl font-semibold text-text">Trending Runners</h2>
        </div>
      </div>
    </div>
  );
}