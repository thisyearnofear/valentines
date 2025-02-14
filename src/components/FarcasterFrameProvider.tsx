"use client";

import { PropsWithChildren, useEffect } from "react";
import FrameSDK from "@farcaster/frame-sdk";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { useConnect } from "wagmi";
import { config } from "./Web3Provider";

export function FarcasterFrameProvider({ children }: PropsWithChildren) {
  const { connect } = useConnect();

  useEffect(() => {
    const init = async () => {
      const context = await FrameSDK.context;

      // Autoconnect if running in a frame
      if (context?.client.clientFid) {
        connect({ connector: farcasterFrame() });
      }

      // Hide splash screen after UI renders
      setTimeout(() => {
        FrameSDK.actions.ready();
      }, 500);
    };

    init();
  }, [connect]);

  return <>{children}</>;
}
