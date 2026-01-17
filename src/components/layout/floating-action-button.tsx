
"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FloatingActionButton() {
    return (
        <div className="fixed bottom-6 left-6 z-50 md:hidden">
            <Link href="/specialized-clinics">
                <Button className="rounded-full w-14 h-14 shadow-2xl bg-primary text-primary-foreground hover:scale-110 transition-transform duration-200 p-0 flex items-center justify-center border-2 border-white">
                    <Calendar className="w-6 h-6" />
                    <span className="sr-only">احجز موعد</span>
                </Button>
            </Link>
        </div>
    );
}
