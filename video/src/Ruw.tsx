import { AbsoluteFill } from "remotion";

export type RuwProps = { script: 1 | 2 | 3 };

// Placeholder tot de ruwe opnames er zijn; hier komt de knippenlijst per script.
export const Ruw: React.FC<RuwProps> = ({ script }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#111",
      color: "#deedf9",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "sans-serif",
      fontSize: 80,
      fontWeight: 900,
    }}
  >
    Script {script}
  </AbsoluteFill>
);
