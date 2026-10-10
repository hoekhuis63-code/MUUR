import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./config";
import { Ruw } from "./Ruw";

export const RemotionRoot: React.FC = () => (
  <>
    {([1, 2, 3] as const).map((script) => (
      <Composition
        key={script}
        id={`ruw-script${script}`}
        component={Ruw}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ script }}
      />
    ))}
  </>
);
