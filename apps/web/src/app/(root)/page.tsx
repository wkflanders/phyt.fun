import { CompetitionMast } from "@/components/Competitions/CompetitionMast";
import { Feed } from "@/components/Feed/Feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Dumbbell, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full pt-16 pb-16">
      <div className="w-full px-8 md:px-16 mb-8">
        <CompetitionMast />
      </div>
      <div className="flex justify-center gap-8 px-8 md:px-16">
        <div className="flex-1 lg:max-w-[50%]">
          <Feed />
        </div>
      </div>
    </div>
  );
}