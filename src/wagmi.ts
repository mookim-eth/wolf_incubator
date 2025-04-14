import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Chain } from "@rainbow-me/rainbowkit";

export const sonic = {
  id: 146,
  name: "Sonic",
  iconUrl: null,
  iconBackground: "#fff",
  nativeCurrency: { name: "Sonic", symbol: "S", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.soniclabs.com"] },
  },
  blockExplorers: {
    default: { name: "SonicScan", url: "https://sonicscan.org" },
  },
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: "Wolf Incubator",
  projectId: "8fbb3bc65e1c9f24d221cd435b09098e",
  chains: [sonic],
  ssr: true,
});
