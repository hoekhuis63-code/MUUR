"""Transcribeert elke video in ../raw naar analysis/<naam>.json met woord-timestamps.

Lokaal, met sherpa-onnx + NVIDIA Parakeet TDT 0.6b v3 (meertalig, ook Nederlands).
Lange opnames worden eerst met Silero VAD in spraakstukken geknipt.
Uitvoer volgt het Caption-formaat van @remotion/captions:
  {text, startMs, endMs, timestampMs, confidence}
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import sherpa_onnx

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "models" / "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
VAD = ROOT / "models" / "silero_vad.onnx"
RAW = ROOT.parent / "raw"
OUT = ROOT / "analysis"
SR = 16000
VIDEO = {".mov", ".mp4", ".m4v"}


def load_audio(path: Path) -> np.ndarray:
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0


def make_recognizer():
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(MODEL / "encoder.int8.onnx"),
        decoder=str(MODEL / "decoder.int8.onnx"),
        joiner=str(MODEL / "joiner.int8.onnx"),
        tokens=str(MODEL / "tokens.txt"),
        model_type="nemo_transducer",
        num_threads=4,
    )


def speech_segments(audio: np.ndarray):
    """Geeft (start_sample, samples) per spraakstuk; ruim gemarkeerd zodat er geen woordbegin wegvalt."""
    cfg = sherpa_onnx.VadModelConfig()
    cfg.silero_vad.model = str(VAD)
    cfg.silero_vad.min_silence_duration = 0.4
    cfg.silero_vad.min_speech_duration = 0.2
    cfg.silero_vad.max_speech_duration = 25
    cfg.sample_rate = SR
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=600)
    win = cfg.silero_vad.window_size
    for i in range(0, len(audio), win):
        vad.accept_waveform(audio[i : i + win])
    vad.flush()
    pad = int(0.25 * SR)
    while not vad.empty():
        seg = vad.front
        start = max(0, seg.start - pad)
        end = min(len(audio), seg.start + len(seg.samples) + pad)
        yield start, audio[start:end]
        vad.pop()


def to_words(tokens, starts, durations, logprobs, offset_s, seg_end_s):
    """Voegt subword-tokens samen tot woorden (spatie of '▁' vooraan = nieuw woord)."""
    words = []
    for i, (tok, t) in enumerate(zip(tokens, starts)):
        dur = durations[i] if durations else None
        t_end = t + dur if dur else (starts[i + 1] if i + 1 < len(starts) else seg_end_s - offset_s)
        lp = logprobs[i] if i < len(logprobs) else 0.0
        if tok[:1] in (" ", "▁") or not words:
            words.append({"text": tok.lstrip(" ▁"), "start": t, "end": t_end, "lp": [lp]})
        else:
            words[-1]["text"] += tok
            words[-1]["end"] = t_end
            words[-1]["lp"].append(lp)
    out = []
    for w in words:
        if not w["text"]:
            continue
        start_ms = round((offset_s + w["start"]) * 1000)
        end_ms = round((offset_s + w["end"]) * 1000)
        out.append(
            {
                "text": " " + w["text"],
                "startMs": start_ms,
                "endMs": max(end_ms, start_ms + 1),
                "timestampMs": (start_ms + end_ms) // 2,
                "confidence": round(float(np.exp(np.mean(w["lp"]))), 3),
            }
        )
    return out


def transcribe(path: Path, recognizer) -> dict:
    audio = load_audio(path)
    captions, segments = [], []
    for start, samples in speech_segments(audio):
        stream = recognizer.create_stream()
        stream.accept_waveform(SR, samples)
        recognizer.decode_stream(stream)
        r = stream.result
        offset = start / SR
        durations = list(getattr(r, "durations", []) or [])
        words = to_words(
            list(r.tokens), list(r.timestamps), durations, list(r.ys_log_probs), offset, offset + len(samples) / SR)
        captions.extend(words)
        segments.append(
            {"startMs": round(offset * 1000), "endMs": round((offset + len(samples) / SR) * 1000), "text": r.text.strip()}
        )
    return {
        "bron": path.name,
        "model": MODEL.name,
        "duurMs": round(len(audio) / SR * 1000),
        "segments": segments,
        "captions": captions,
    }


def main():
    files = [Path(a) for a in sys.argv[1:]] or sorted(p for p in RAW.glob("*") if p.suffix.lower() in VIDEO)
    if not files:
        sys.exit(f"Geen video's gevonden in {RAW}")
    OUT.mkdir(exist_ok=True)
    recognizer = make_recognizer()
    for f in files:
        result = transcribe(f, recognizer)
        dest = OUT / f"{f.stem}.json"
        dest.write_text(json.dumps(result, ensure_ascii=False, indent=2))
        print(f"{f.name}: {len(result['captions'])} woorden, {len(result['segments'])} stukken -> {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
