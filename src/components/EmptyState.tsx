import React from "react";
import { INCUBATOR_CONTRACT_ADDRESS } from "../constants/addresses";

export const EmptyState = () => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 1rem",
        borderRadius: "12px",
        backgroundColor: "white",
        border: "1px dashed #ccc",
        margin: "2rem 0",
        maxWidth: "700px",
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#999"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ margin: "0 auto 1.5rem" }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <h3 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "1rem" }}>
        No Wolf NFTs Found
      </h3>
      <p
        style={{
          color: "#666",
          maxWidth: "500px",
          margin: "0 auto 1.5rem",
          lineHeight: "1.6",
        }}
      >
        You don't currently own any Wolf NFTs in your connected wallet. Once you
        acquire some, they'll appear here along with their feeding status!
      </p>

      <div
        style={{
          backgroundColor: "#f7f7f7",
          padding: "15px",
          borderRadius: "8px",
          maxWidth: "500px",
          margin: "0 auto 1.5rem",
          textAlign: "left",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#444" }}>
          About Wolf NFTs:
        </h4>
        <ul style={{ color: "#666", paddingLeft: "20px", margin: 0 }}>
          <li style={{ marginBottom: "8px" }}>
            Wolf NFTs need to eat SHEEP tokens regularly to survive
          </li>
          <li style={{ marginBottom: "8px" }}>
            Wolves get hungry every day (24 hours) and starve after a week
          </li>
          <li style={{ marginBottom: "8px" }}>
            Each time you feed a wolf, its appetite grows larger
          </li>
          <li style={{ marginBottom: "8px" }}>
            Wolves can only eat from the market 3 times in a row
          </li>
          <li>
            After 3 market feedings, they must eat from a non-market source
          </li>
        </ul>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "500px",
          margin: "0 auto",
          gap: "20px",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#e6f7ff",
            padding: "15px",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#0d76fc" }}>
            <span role="img" aria-label="info" style={{ marginRight: "8px" }}>
              ℹ️
            </span>
            Wolf Status Colors
          </h4>
          <div style={{ color: "#555", fontSize: "0.9rem" }}>
            <div
              style={{
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  backgroundColor: "#00cc00",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
              ></span>
              <span>Fed: Wolf is well fed</span>
            </div>
            <div
              style={{
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  backgroundColor: "#ff9900",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
              ></span>
              <span>Hungry: Wolf needs feeding</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  backgroundColor: "#ff0000",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
              ></span>
              <span>Starved: Wolf has starved</span>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: "#f0f0f0",
            padding: "15px",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#444" }}>
            About Wolf Incubator:
          </h4>
          <p style={{ color: "#555", fontSize: "0.9rem", margin: 0 }}>
            Wolf Incubator is a service for the{" "}
            <a
              href="https://www.sheeponsonic.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              SHEEP game
            </a>{" "}
            on Sonic. We are not affiliated with the game's creators. You can
            view our{" "}
            <a
              href={`https://sonicscan.org/address/${INCUBATOR_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              smart contract on SonicScan
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
