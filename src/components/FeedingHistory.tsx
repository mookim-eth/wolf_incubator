import React from "react";
import { useFeedingHistory } from "../hooks/useFeedingHistory";

export const FeedingHistory = () => {
  const {
    feedingHistory,
    isLoading,
    isError,
    error,
    refetch,
    totalEarnings,
    totalValueUSD,
  } = useFeedingHistory();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        Loading feeding history...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          color: "#721c24",
          backgroundColor: "#f8d7da",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <p>
          Error:{" "}
          {error instanceof Error
            ? error.message
            : "Failed to load feeding history"}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            backgroundColor: "#0d76fc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (feedingHistory.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p>No feeding history found for your wallet.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2>Feeding History</h2>
        <button
          onClick={() => refetch()}
          style={{
            padding: "8px 16px",
            background: "#0d76fc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#e6f7ff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>
          Total Earnings: {totalEarnings.toFixed(6)} SHEEP
        </div>
        <div>Value: ${totalValueUSD.toFixed(2)} USD</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f2f2f2",
                borderBottom: "2px solid #ddd",
              }}
            >
              <th style={{ padding: "10px", textAlign: "left" }}>Tx</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Wolf</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Burned</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Earned</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Fee</th>
            </tr>
          </thead>
          <tbody>
            {feedingHistory.map((record, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid #ddd",
                  backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                }}
              >
                <td style={{ padding: "10px" }}>
                  <a
                    href={`https://sonicscan.org/tx/${record.txhash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d76fc", textDecoration: "none" }}
                  >
                    {formatAddress(record.txhash)}
                  </a>
                </td>
                <td style={{ padding: "10px" }}>
                  {formatTimestamp(record.timestamp)}
                </td>
                <td style={{ padding: "10px" }}>{record.wolfid}</td>
                <td style={{ padding: "10px" }}>{record.sheepburn}</td>
                <td style={{ padding: "10px" }}>
                  {record.userearn.toFixed(4)}
                </td>
                <td style={{ padding: "10px" }}>{record.paidfee.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
