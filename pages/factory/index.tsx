import { WalletSection } from "@/components";
import DenomInfo from "@/components/factory/components/DenomInfo";
import MyDenoms from "@/components/factory/components/MyDenoms";
import { useTokenFactoryDenoms, useTokenFactoryDenomsMetadata } from "@/hooks";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { useChain } from "@cosmos-kit/react";

import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";

import { chainName } from "@/config";

export default function Factory() {
  const { address, isWalletConnected } = useChain(chainName);
  const { denoms, isDenomsLoading, isDenomsError, refetchDenoms } =
    useTokenFactoryDenoms(address ?? "");
  const { metadatas, isMetadatasLoading, isMetadatasError, refetchMetadatas } =
    useTokenFactoryDenomsMetadata();

  const [selectedDenom, setSelectedDenom] = useState<string | null>(null);
  const [selectedDenomMetadata, setSelectedDenomMetadata] =
    useState<MetadataSDKType | null>(null);

  // Combine denoms and metadatas
  const combinedData = useMemo(() => {
    if (denoms && metadatas) {
      return denoms.denoms
        .map((denom: string) => {
          return (
            metadatas.metadatas.find((meta) => meta.base === denom) || null
          );
        })
        .filter(
          (meta: MetadataSDKType | null) => meta !== null
        ) as MetadataSDKType[];
    }
    return [];
  }, [denoms, metadatas]);

  const handleDenomSelect = (denom: MetadataSDKType) => {
    setSelectedDenom(denom.base);
    setSelectedDenomMetadata(denom);
  };

  return (
    <>
      <div className="max-w-5xl relative py-8 mx-auto">
        <Head>
          <title>Factory - Alberto</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta
            name="description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta
            name="keywords"
            content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
          />
          <meta name="author" content="Chandra Station" />
          <link rel="icon" href="/favicon.ico" />

          <meta property="og:title" content="Factory - Alberto" />
          <meta
            property="og:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta property="og:url" content="https://" />
          <meta property="og:image" content="https://" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Alberto" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Factory - Alberto" />
          <meta
            name="twitter:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta name="twitter:image" content="https://" />
          <meta name="twitter:site" content="@" />

          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Factory - Alberto",
              description: "Alberto is the gateway to the Manifest Network",
              url: "https://",
              image: "https://",
              publisher: {
                "@type": "Organization",
                name: "Chandra Station",
                logo: {
                  "@type": "ImageObject",
                  url: "https:///img/logo.png",
                },
              },
            })}
          </script>
        </Head>
        <div className="flex items-center justify-between flex-wrap -ml-4 -mt-2 sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none text-4xl xl:text-4xl md:block hidden">
              Factory{" "}
            </h3>
            <h3 className="tracking-tight px-4 leading-none text-4xl xl:text-4xl md:hidden block">
              Factory{" "}
            </h3>
          </div>
          {isWalletConnected && (
            <Link href="/factory/create" passHref>
              <button className="relative items-center btn btn-primary hidden md:inline-flex">
                Create New Token
              </button>
            </Link>
          )}
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col lg:flex-row rounded-md bg-base-200/20 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected ? (
            <section className="transition-opacity duration-300 ease-in-out animate-fadeIn w-full">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl">
                    Connect your wallet!
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    Use the button below to connect your wallet and start
                    minting tokens.
                  </p>
                  <WalletSection chainName="manifest" />
                </div>
                <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                  <img src="/factory.svg" alt="groups" className="h-60 w-60" />
                </div>
              </div>
            </section>
          ) : (
            isWalletConnected && (
              <div className="flex flex-col w-full">
                <div className="flex flex-col sm:flex-col w-full gap-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
                  <div className="flex flex-row gap-4 justify-between items-center w-full">
                    <div className="w-1/3 h-full">
                      <MyDenoms
                        denoms={combinedData}
                        isLoading={isDenomsLoading || isMetadatasLoading}
                        isError={isDenomsError || isMetadatasError}
                        refetchDenoms={refetchDenoms}
                        onSelectDenom={handleDenomSelect}
                      />
                    </div>
                    <div className="w-2/3 h-full">
                      <DenomInfo
                        denom={selectedDenomMetadata}
                        address={address ?? ""}
                        refetchDenoms={refetchDenoms}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
