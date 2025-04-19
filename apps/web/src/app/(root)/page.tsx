import { ActivityBox } from '@/components/ActivityBox';
import { CompetitionMast } from '@/components/competitions/CompetitionMast';
import { Feed } from '@/components/feed/Feed';

export default function Home() {
    return (
        <>
            <div className="flex flex-col items-center justify-center w-full border-b h-1/3 bg-primary-gradient backdrop-blur-md border-white/10">
                <div className="w-4/5 mt-72">
                    <CompetitionMast />
                </div>
            </div>
            <div className="border-b bg-background h-72 border-white/10"></div>
            <div>
                <div className="flex justify-center gap-8 bg-background pt-12">
                    <div className="flex-1 lg:max-w-[40%]">
                        <Feed />
                    </div>
                    <ActivityBox />
                </div>
            </div>
        </>
    );
}
