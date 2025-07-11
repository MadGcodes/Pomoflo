// src/components/qrscanner.tsx
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";

const QRScanner = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const { startTimer, switchToPomodoro } = usePomodoro();

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText: string, decodedResult: any) => {
        console.log("QR Code detected:", decodedText);
        switchToPomodoro();
        startTimer();
        alert(`QR Scanned: ${decodedText}`);
        scanner.clear();
      },
      (errorMessage: string) => {
        // optional debug logs
        console.warn("QR scan error:", errorMessage);
      }
    );

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear QR scanner:", error);
      });
    };
  }, []);

  return (
    <div className="p-4">
      <div id="qr-reader" ref={scannerRef} />
    </div>
  );
};

export default QRScanner;
