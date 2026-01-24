"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AppProviderTanStack from "./app-provider-tanstack";

import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AppProviderTanStack>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </AppProviderTanStack>
      <Toaster />
    </ThemeProvider>
  );
}
