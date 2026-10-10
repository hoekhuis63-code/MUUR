// Transcribeert elke video in ../raw naar analysis/<naam>.json met woord-timestamps.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { toCaptions, transcribe } from "@remotion/install-whisper-cpp";

const whisperPath = path.resolve("whisper.cpp");
const model = process.env.WHISPER_MODEL ?? "medium";
const rawDir = path.resolve("..", "raw");
const outDir = path.resolve("analysis");
fs.mkdirSync(outDir, { recursive: true });

const files = fs.existsSync(rawDir)
  ? fs.readdirSync(rawDir).filter((f) => /\.(mov|mp4|m4v)$/i.test(f))
  : [];
if (files.length === 0) {
  console.error(`Geen video's gevonden in ${rawDir}`);
  process.exit(1);
}

for (const file of files) {
  const name = path.parse(file).name;
  const wav = path.join(outDir, `${name}.wav`);
  // whisper.cpp wil 16 kHz mono wav
  execFileSync("ffmpeg", ["-y", "-i", path.join(rawDir, file), "-ar", "16000", "-ac", "1", wav], {
    stdio: "ignore",
  });
  const { transcription } = await transcribe({
    inputPath: wav,
    whisperPath,
    whisperCppVersion: "1.5.5",
    model,
    language: "nl",
    tokenLevelTimestamps: true,
  });
  const { captions } = toCaptions({ whisperCppOutput: { transcription } });
  fs.writeFileSync(
    path.join(outDir, `${name}.json`),
    JSON.stringify({ bron: file, model, captions }, null, 2),
  );
  fs.rmSync(wav);
  console.log(`${file}: ${captions.length} woorden -> analysis/${name}.json`);
}
