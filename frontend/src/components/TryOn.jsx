import React, { useEffect, useRef, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

export default function TryOn({ overlayText = "TRY ON" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;
    let net;
    let rafId;

    async function start() {
      try {
        // 1) Camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // 2) Load BodyPix model
        net = await bodyPix.load({
          architecture: "MobileNetV1",
          outputStride: 16,
          multiplier: 0.75,
          quantBytes: 2,
        });

        setReady(true);

        // 3) Loop: segment + draw overlay
        const loop = async () => {
          if (!videoRef.current || !canvasRef.current) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Person segmentation
          const segmentation = await net.segmentPerson(video, {
            internalResolution: "medium",
            segmentationThreshold: 0.7,
          });

          // Draw original video
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Create a mask (person vs background)
          const mask = bodyPix.toMask(segmentation);

          // Dim background a bit (simple AR feel)
          const bg = { r: 0, g: 0, b: 0, a: 120 };
          const fg = { r: 0, g: 0, b: 0, a: 0 };
          const coloredMask = bodyPix.toMask(segmentation, fg, bg);

          // draw mask on top
          bodyPix.drawMask(
            canvas,
            video,
            coloredMask,
            0.7, // opacity
            0,   // mask blur
            false
          );

          // Simple overlay “label” on chest area (demo AR)
          ctx.font = "bold 32px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillText(overlayText, canvas.width * 0.35, canvas.height * 0.25);

          rafId = requestAnimationFrame(loop);
        };

        loop();
      } catch (e) {
        console.log(e);
        setError("Camera or model error. Please allow camera access.");
      }
    }

    start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [overlayText]);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">AR Try-On (Demo)</h3>

      {error && <div className="text-red-600">{error}</div>}
      {!ready && !error && <div>Loading camera + model...</div>}

      {/* Hidden video source */}
      <video ref={videoRef} style={{ display: "none" }} playsInline />

      {/* Output canvas */}
      <canvas ref={canvasRef} className="w-full max-w-xl rounded" />
      <p className="text-xs text-gray-500 mt-2">
        Tip: This is a demo overlay. You can replace text with an image overlay later.
      </p>
    </div>
  );
}