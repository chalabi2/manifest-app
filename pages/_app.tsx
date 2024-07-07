import "../styles/globals.css";
import "@interchain-ui/react/styles";
import "@fontsource/rubik";

import type { AppProps } from "next/app";

import { PromptSign, SignData } from "@cosmos-kit/web3auth";
import { makeWeb3AuthWallets } from "@cosmos-kit/web3auth/esm/index";
import { useMemo, useState } from "react";
import SignModal from "@/components/groups/modals/authSignerModal";

import { SignerOptions, wallets } from "cosmos-kit";
import { ChainProvider } from "@cosmos-kit/react";
import { Registry } from "@cosmjs/proto-signing";
import { TailwindModal } from "../components";
import { ThemeProvider } from "../contexts/theme";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SideNav from "../components/react/sideNav";
import { AssetList, Chain } from "@chain-registry/types";
import { SigningStargateClientOptions, AminoTypes } from "@cosmjs/stargate";
import {
  manifestAminoConverters,
  manifestProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
  cosmosAminoConverters,
  cosmosProtoRegistry,
} from "@chalabi/manifestjs";

import MobileNav from "@/components/react/mobileNav";

import * as Ably from "ably";
import { AblyProvider, useChannel, usePresence } from "ably/react";

const manifestChain: Chain = {
  chain_name: "manifest",
  status: "live",
  network_type: "testnet",
  website: "https://althea.net/",
  pretty_name: "Manifest Testnet",
  chain_id: "manifest-1",
  bech32_prefix: "manifest",
  daemon_name: "manifest",
  node_home: "$HOME/.manifest",
  slip44: 118,
  apis: {
    rpc: [
      {
        address: "https://nodes.chandrastation.com/rpc/manifest/",
        provider: undefined,
        archive: undefined,
      },
    ],
    rest: [
      {
        address: "https://nodes.chandrastation.com/api/manifest/",
        provider: undefined,
        archive: undefined,
      },
    ],
  },
  fees: {
    fee_tokens: [
      {
        denom: "umfx",
        fixed_min_gas_price: 0.001,
        low_gas_price: 0.001,
        average_gas_price: 0.001,
        high_gas_price: 0.001,
      },
    ],
  },
  staking: {
    staking_tokens: [
      {
        denom: "upoa",
      },
    ],
  },
  codebase: {
    git_repo: "github.com/liftedinit/manifest-ledger",
    recommended_version: "v0.0.1-alpha.4",
    compatible_versions: ["v0.0.1-alpha.4"],
    binaries: {
      "linux/amd64":
        "https://github.com/liftedinit/manifest-ledger/releases/download/v0.0.1-alpha.4/manifest-ledger_0.0.1-alpha.4_linux_amd64.tar.gz",
    },
    versions: [
      {
        name: "v1",
        recommended_version: "v0.0.1-alpha.4",
        compatible_versions: ["v0.0.1-alpha.4"],
      },
    ],
    genesis: {
      genesis_url:
        "https://github.com/liftedinit/manifest-ledger/blob/main/network/manifest-1/manifest-1_genesis.json",
    },
  },
};
const manifestAssets: AssetList = {
  chain_name: "manifest",
  assets: [
    {
      description: "Manifest testnet native token",
      denom_units: [
        {
          denom: "umfx",
          exponent: 0,
        },
        {
          denom: "mfx",
          exponent: 6,
        },
      ],
      base: "umfx",
      name: "Manifest Testnet Token",
      display: "mfx",
      symbol: "MFX",
    },
    {
      description: "Proof of Authority token for the Manifest testnet",
      denom_units: [
        {
          denom: "upoa",
          exponent: 0,
        },
        {
          denom: "poa",
          exponent: 6,
        },
      ],
      base: "upoa",
      name: "Manifest Testnet Token",
      display: "poa",
      symbol: "POA",
    },
  ],
};

function ManifestApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    signingStargate: (
      _chain: string | Chain
    ): SigningStargateClientOptions | undefined => {
      const mergedRegistry = new Registry([
        ...manifestProtoRegistry,
        ...cosmosProtoRegistry,
        ...osmosisProtoRegistry,
      ]);
      const mergedAminoTypes = new AminoTypes({
        ...cosmosAminoConverters,
        ...manifestAminoConverters,
        ...osmosisAminoConverters,
      });
      return {
        aminoTypes: mergedAminoTypes,
        // @ts-ignore
        registry: mergedRegistry,
      };
    },
  };

  const client = new QueryClient();

  const [web3AuthPrompt, setWeb3AuthPrompt] = useState<
    | {
        signData: SignData;
        resolve: (approved: boolean) => void;
      }
    | undefined
  >();
  const web3AuthWallets = useMemo(
    () =>
      makeWeb3AuthWallets({
        loginMethods: [
          {
            provider: "google",
            name: "Google",
            logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
          },
          {
            provider: "twitter",
            name: "Twitter",
            logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
          },
          {
            provider: "github",
            name: "GitHub",
            logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Github_logo_svg.svg",
          },
          {
            provider: "apple",
            name: "Apple",
            logo: "/appleBlack.svg",
          },
          {
            provider: "discord",
            name: "Discord",
            logo: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/653714c174fc6c8bbea73caf_636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg",
          },
        ],

        client: {
          clientId: process.env.NEXT_PUBLIC_WEB3_CLIENT_ID ?? "",
          web3AuthNetwork: "testnet",
        },

        promptSign: async (_, signData) =>
          new Promise((resolve) =>
            setWeb3AuthPrompt({
              signData,
              resolve: (approved) => {
                setWeb3AuthPrompt(undefined);
                resolve(approved);
              },
            })
          ),
      }),
    []
  );

  const combinedWallets = [...web3AuthWallets, ...wallets];

  // const ablyClient = new Ably.Realtime({
  //   key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
  // });

  return (
    // <AblyProvider client={ablyClient}>
    <QueryClientProvider client={client}>
      <ReactQueryDevtools />
      <ChainProvider
        chains={[manifestChain]}
        assetLists={[manifestAssets]}
        wallets={combinedWallets}
        logLevel="NONE"
        endpointOptions={{
          isLazy: true,
          endpoints: {
            manifest: {
              rpc: ["https://nodes.chandrastation.com/rpc/manifest/"],
              rest: ["https://nodes.chandrastation.com/api/manifest/"],
            },
          },
        }}
        walletConnectOptions={{
          signClient: {
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_KEY ?? "",
            relayUrl: "wss://relay.walletconnect.org",
            metadata: {
              name: "Alberto",
              description: "Manifest Network Web App",
              url: "https://alberto.com",
              icons: [],
            },
          },
        }}
        signerOptions={signerOptions}
        walletModal={TailwindModal}
      >
        <ThemeProvider>
          <SideNav />
          <MobileNav />
          <div className="min-h-screen max-w-screen md:ml-20 sm:px-4 sm:py-2 bg-base-200 ">
            <Component {...pageProps} />
            <SignModal
              visible={web3AuthPrompt !== undefined}
              onClose={() => web3AuthPrompt?.resolve(false)}
              data={web3AuthPrompt?.signData ?? ({} as SignData)}
              approve={() => web3AuthPrompt?.resolve(true)}
              reject={() => web3AuthPrompt?.resolve(false)}
            />
          </div>
        </ThemeProvider>
      </ChainProvider>
    </QueryClientProvider>
    // </AblyProvider>
  );
}

export default ManifestApp;
