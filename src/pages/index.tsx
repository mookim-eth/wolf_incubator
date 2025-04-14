import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useState, useEffect } from "react";
import { NFTCard } from "../components/NFTCard";
import { FeedingHistory } from "../components/FeedingHistory";
import { useNFTs } from "../hooks/useNFTs";
import { useIncubator } from "../hooks/useIncubator";
import { INCUBATOR_CONTRACT_ADDRESS } from "../constants/addresses";

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("wolves");

  const {
    status,
    getApprovalParams,
    handleAuthorize,
    handleDeauthorize,
    refetch,
  } = useIncubator();
  const {
    nfts,
    loading,
    error,
    isRefetching,
    refetch: refetchNFTs,
  } = useNFTs("0xf1152a195b93d51457633f96b81b1cf95a96e7a7");
  const { writeContract } = useWriteContract();

  const handleAuthToggle = async () => {
    if (!isConnected) return;

    const callbacks = {
      onSuccess: () => {
        refetch();
      },
      onError: (err: Error) => {
        console.error("Authorization transaction failed:", err);
      },
    };

    if (status.isAuthenticated) {
      handleDeauthorize(callbacks);
    } else {
      handleAuthorize(callbacks);
    }
  };

  // Only show wallet-dependent UI after component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderEmptyState = () => (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        borderRadius: "12px",
        backgroundColor: "white",
        border: "1px dashed #ccc",
        margin: "2rem 0",
      }}
    >
      <h3>No Wolf NFTs Found</h3>
      <p>You don't currently own any Wolf NFTs in your connected wallet.</p>
    </div>
  );

  const renderWolves = () => {
    if (loading && !isRefetching) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading your Wolf NFTs...
        </div>
      );
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (nfts.length === 0) {
      return renderEmptyState();
    }

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={refetchNFTs}
            disabled={isRefetching}
            style={{
              padding: "8px 16px",
              background: "#0d76fc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              opacity: isRefetching ? 0.7 : 1,
            }}
          >
            {isRefetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className={styles.grid}>
          {nfts.map((nft) => (
            <NFTCard
              key={nft.id}
              id={nft.id}
              image={nft.metadata?.image}
              attributes={nft.metadata?.attributes}
              hungryTime={nft.hungryTime}
              starvedTime={nft.starvedTime}
              hungerAmount={nft.hungerAmount}
              eatenFromMarket={nft.eatenFromMarket}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderServicePanel = () => {
    return (
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "white",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h2>⚙️ Wolf Auto-Feeding Service</h2>

        {status.isAuthenticated ? (
          <div
            style={{
              backgroundColor: "#d4edda",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <p>
              <strong>Status:</strong> Active ✅
            </p>
            <p>Your wolves will be automatically fed to prevent starvation.</p>
            <p>
              Service fee:{" "}
              {status.userRatio ? `${status.userRatio}%` : "Default"}
            </p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#fff3cd",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <p>⏳ Authorize our service to automatically feed your wolves.</p>
          </div>
        )}

        <button
          onClick={handleAuthToggle}
          style={{
            backgroundColor: status.isAuthenticated ? "#dc3545" : "#0d76fc",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          {status.isAuthenticated
            ? "🛑 Revoke Authorization"
            : "✨ Authorize Auto-Feeding"}
        </button>
      </div>
    );
  };

  const renderTabs = () => (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <button
        onClick={() => {
          setActiveTab("wolves");
        }}
        style={{
          padding: "0.5rem 1rem",
          background: activeTab === "wolves" ? "#0d76fc" : "#f0f0f0",
          color: activeTab === "wolves" ? "white" : "#333",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        🐺 My Wolves
      </button>
      <button
        onClick={() => {
          setActiveTab("history");
        }}
        style={{
          padding: "0.5rem 1rem",
          background: activeTab === "history" ? "#0d76fc" : "#f0f0f0",
          color: activeTab === "history" ? "white" : "#333",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        📜 Feeding History
      </button>
      <button
        onClick={() => {
          setActiveTab(activeTab === "faq" ? "wolves" : "faq");
        }}
        style={{
          padding: "0.5rem 1rem",
          background: activeTab === "faq" ? "#0d76fc" : "#f0f0f0",
          color: activeTab === "faq" ? "white" : "#333",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "500",
          marginLeft: "auto",
        }}
      >
        ❓ FAQ
      </button>
    </div>
  );

  const renderFAQ = () => (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        marginBottom: "2rem",
      }}
    >
      <h2>
        <span role="img" aria-label="question mark">
          ❓
        </span>{" "}
        Frequently Asked Questions
      </h2>

      <div style={{ marginBottom: "1rem" }}>
        <h3>
          <span role="img" aria-label="thinking face">
            🤔
          </span>{" "}
          What is this service?
        </h3>
        <p>
          Wolf Incubator provides automatic feeding for your Wolf NFTs to
          prevent them from starving. This is a service for the{" "}
          <a
            href="https://www.sheeponsonic.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0d76fc" }}
          >
            SHEEP game
          </a>{" "}
          on Sonic, but we are not affiliated with or endorsed by the game's
          creators.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3>
          <span role="img" aria-label="gears">
            ⚙️
          </span>{" "}
          How does Wolf Incubator work?
        </h3>
        <p>
          Our service keeps an eye on your wolves. When they get hungry, we
          automatically feed them using the SHEEP tokens they would normally
          earn. This ensures they never starve! After feeding, we handle the
          process of collecting the rewards, take a small service fee, and send
          the rest directly to your wallet.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3>
          <span role="img" aria-label="shield">
            🛡️
          </span>{" "}
          Is this service secure?
        </h3>
        <p>
          Absolutely. When you authorize Wolf Incubator, you're only giving our
          smart contract permission to perform the feeding action on your
          behalf. We never gain control of your Wolf NFTs or other assets. You
          can view our verified{" "}
          <a
            href={`https://sonicscan.org/address/${INCUBATOR_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0d76fc" }}
          >
            contract code on SonicScan
          </a>{" "}
          for full transparency, and you can revoke the authorization at any
          time, instantly stopping the service.
        </p>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>🐺 Wolf Incubator</title>
        <meta
          content="Automated feeding service for your Wolf NFTs from the SHEEP game"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 0",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🐺 Wolf Incubator</h1>
        <ConnectButton />
      </header>

      <main className={styles.main}>
        {isMounted && !isConnected ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                maxWidth: "500px",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{ marginBottom: "1rem" }}>🔗 Connect Your Wallet</h2>
              <p
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  color: "#666",
                }}
              >
                Connect your wallet to manage your Wolf NFTs from the{" "}
                <a
                  href="https://www.sheeponsonic.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", color: "#0d76fc" }}
                >
                  SHEEP game
                </a>
                .
              </p>
              <ConnectButton />
            </div>
            {renderFAQ()}
          </>
        ) : (
          <>
            {renderServicePanel()}
            {renderTabs()}

            {activeTab === "faq" ? (
              renderFAQ()
            ) : activeTab === "wolves" ? (
              renderWolves()
            ) : (
              <FeedingHistory />
            )}
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <div style={{ textAlign: "center", color: "#666" }}>
          <p style={{ margin: "0 0 10px 0" }}>
            🐾 Wolf Incubator &copy; {new Date().getFullYear()}
          </p>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>
            A service for the{" "}
            <a
              href="https://www.sheeponsonic.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", color: "#0d76fc" }}
            >
              SHEEP game
            </a>{" "}
            on Sonic. Not affiliated with or endorsed by the game's creators.{" "}
            <a
              href={`https://sonicscan.org/address/${INCUBATOR_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0d76fc" }}
            >
              View Contract
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
