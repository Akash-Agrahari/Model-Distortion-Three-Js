import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Loader({ onComplete }) {
  const highlightRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    // Step 1: Wait, then grow highlight from center
    tl.fromTo(
      highlightRef.current,
      { scaleX: 0, opacity: 1 },
      { scaleX: 1, duration: 5 },
      "+=1.5"
    );

    // Step 2: Fade out loader screen
    tl.to(containerRef.current, { opacity: 0, duration: 0.5 }, "+=0.3");

    // Step 3: After fade-out, call onComplete
    tl.call(() => {
      if (onComplete) onComplete();
    });
  }, [onComplete]);

  return (
    <div ref={containerRef} style={styles.container}>
      <div style={styles.baseLine} />
      <div ref={highlightRef} style={styles.highlightLine} />
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    overflow: "hidden",
    zIndex: 9999 // ensure loader stays on top
  },
  baseLine: {
    position: "absolute",
    height: "2px",
    width: "20%",
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  highlightLine: {
    position: "absolute",
    height: "2px",
    width: "20%",
    backgroundColor: "#fff",
    transformOrigin: "center center",
    transform: "scaleX(0)"
  }
}; 