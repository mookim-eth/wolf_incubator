import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";

interface NFTCardProps {
  id: number;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  hungryTime?: number;
  starvedTime?: number;
  hungerAmount?: number;
  eatenFromMarket?: number;
}

export const NFTCard = ({
  id,
  image,
  attributes,
  hungryTime,
  starvedTime,
  hungerAmount,
  eatenFromMarket,
}: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(
    Math.floor(Date.now() / 1000),
  );

  // Update current time every minute to keep wolf status accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatImageUrl = (url: string) => {
    if (url.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${url.split("ipfs://")[1]}`;
    }
    return url;
  };

  // Format time difference in a human-readable way
  const formatTimeDiff = (timestamp?: number): string => {
    if (!timestamp) return "Unknown";
    const diffSeconds = timestamp - currentTime;
    if (diffSeconds <= 0) return "Now";

    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor((diffSeconds % 86400) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate wolf status based on timestamps
  const getWolfStatus = (): { status: string; color: string } => {
    if (!hungryTime || !starvedTime)
      return { status: "Unknown", color: "#999" };

    if (currentTime >= starvedTime) {
      return { status: "Starved ☠️", color: "#ff0000" };
    }

    if (currentTime >= hungryTime) {
      return { status: "Hungry 🍖", color: "#ff9900" };
    }

    return { status: "Fed 😊", color: "#00cc00" };
  };

  const wolfStatus = getWolfStatus();

  return (
    <div className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ margin: 0 }}>Wolf #{id}</h3>
        <div
          style={{
            backgroundColor: wolfStatus.color,
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          {wolfStatus.status}
        </div>
      </div>

      {image && !imageError ? (
        <img
          src={formatImageUrl(image)}
          alt={`Wolf #${id}`}
          style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
          onError={handleImageError}
        />
      ) : (
        <div
          style={{
            backgroundColor: "#f0f0f0",
            height: "200px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
          }}
        >
          <span>Wolf #{id}</span>
        </div>
      )}

      {(hungryTime || starvedTime) && (
        <div
          style={{
            marginTop: "12px",
            backgroundColor: "#f7f7f7",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          {hungryTime && (
            <div>
              <span style={{ fontWeight: "bold" }}>Hungry in: </span>
              <span
                style={{
                  color: currentTime >= hungryTime ? "#ff9900" : "#333",
                }}
              >
                {currentTime >= hungryTime
                  ? "Hungry now!"
                  : formatTimeDiff(hungryTime)}
              </span>
            </div>
          )}
          {starvedTime && (
            <div>
              <span style={{ fontWeight: "bold" }}>Starves in: </span>
              <span
                style={{
                  color:
                    currentTime >= starvedTime
                      ? "#ff0000"
                      : currentTime + 86400 >= starvedTime
                        ? "#ff9900"
                        : "#333",
                }}
              >
                {currentTime >= starvedTime
                  ? "Starved!"
                  : formatTimeDiff(starvedTime)}
              </span>
            </div>
          )}
          {hungerAmount && (
            <div>
              <span style={{ fontWeight: "bold" }}>Next meal: </span>
              <span>{hungerAmount} SHEEP</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
