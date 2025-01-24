import { Feed } from "@/components/Feed/Feed";
import { WalletCard } from "@/components/WalletCard";

export default function Home() {
  return (
    <div className="flex flex-1 gap-4">
      <Feed />
      <div className="hidden lg:block">
        <WalletCard />
      </div>
    </div>
  );
}