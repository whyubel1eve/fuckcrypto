"use client";

import React from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { BatchSender } from "@/components/BatchSender";

const MANIFEST_URL =
  "https://whyubel1eve.github.io/ton-connect-manifest/tonconnect-manifest.json";

export default function Home() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <BatchSender />
    </TonConnectUIProvider>
  );
}
