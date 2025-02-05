import { Feed } from "@/components/Feed/Feed";
import { WalletPopover } from "@/components/WalletPopover";

export default function Home() {
  return (
    <div className="flex flex-1 gap-4">
      <Feed />
      <div className="hidden lg:block">
        <WalletPopover />
      </div>
    </div>
  );
}