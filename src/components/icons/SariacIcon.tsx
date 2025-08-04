import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SariacIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(props.className)}
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <path d="m15.5 7.5-3 3-3-3"></path>
        <path d="m15.5 11.5-3-3-3 3"></path>
    </svg>
  );
}
