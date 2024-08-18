"use client";

import React from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { BatchSender } from "@/components/BatchSender";

const MANIFEST_URL =
  "https://github.com/whyubel1eve/fuckcrypto/tonconnect-manifest.json";

export default function Home() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <BatchSender />
    </TonConnectUIProvider>
  );
}
