"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";

interface AsideItemProps {
  title: string;
  href: string;
  icon: string;
  alt: string;
}

export const AsideItem = ({ title, href, icon, alt }: AsideItemProps) => {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);

  return (
    <li className={`flex align-middle ${isActive ? "bg-gray-800" : ""}`}>
      <Link href={href} className="flex items-center gap-3 group">
        <Image
          src={icon}
          alt={alt}
          height={30}
          width={30}
          className={`transition group-hover:filter group-hover:brightness-200 ${isActive ? "brightness-200" : "filter grayscale"
            }`}
        />
        <h1
          className={`text-2xl font-inter-700 transition ${isActive ? "text-white" : "text-gray-600"
            } group-hover:text-white`}
        >
          {title}
        </h1>
      </Link>
    </li>
  );
};
