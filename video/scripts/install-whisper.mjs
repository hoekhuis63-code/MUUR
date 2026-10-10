import path from "node:path";
import { downloadWhisperModel, installWhisperCpp } from "@remotion/install-whisper-cpp";

const to = path.resolve("whisper.cpp");
const model = process.env.WHISPER_MODEL ?? "medium";

await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ folder: to, model });
console.log(`whisper.cpp + model ${model} klaar in ${to}`);
