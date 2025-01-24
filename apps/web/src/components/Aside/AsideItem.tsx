"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface AsideItemProps {
  title: string;
  href: string;
  icon: string;
  alt: string;
}

export const AsideItem = ({ title, href, icon, alt }: AsideItemProps) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <li className="flex align-middle" >
      <Link href={href} className="flex items-center gap-3 group">
        <Image
          src={icon}
          alt={alt}
          height={30}
          width={30}
          className={`transition-all duration-200 ease-in-out ${isActive
            ? "brightness-100 opacity"
            : "brightness-50 grayscale opacity-50"
            } group-hover:brightness-100 group-hover:opacity-100`}
        />
        <h1
          className={`text-2xl font-inter-700 transition ${isActive ? "text-white" : "text-gray-600"
            } group-hover:text-white`}
        >
          {title}
        </h1>
      </Link>
    </li >
  );
};
