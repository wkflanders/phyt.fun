import { useState, useEffect, useCallback, RefObject } from "react";

export function useScroll(ref: RefObject<HTMLDivElement | null>) {
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = useCallback(() => {
        if (ref.current) {
            setScrolled(ref.current.scrollTop > 1);
        }
    }, [ref]);

    useEffect(() => {
        const scrollEl = ref.current;
        if (!scrollEl) return;
        scrollEl.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();
        return () => { scrollEl.removeEventListener("scroll", handleScroll); };
    }, [handleScroll, ref]);

    return scrolled;
}