#!/usr/bin/env bash
# Installeert de lokale transcriptie: sherpa-onnx (PyPI) + Parakeet TDT v3 en Silero VAD (GitHub Releases).
# Hugging Face is in deze omgeving geblokkeerd, daarom geen whisper.cpp-modellen.
set -euo pipefail
cd "$(dirname "$0")/.."
REL=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models
MODEL=sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8

[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q -r scripts/requirements.txt
mkdir -p models
if [ ! -f "models/$MODEL/encoder.int8.onnx" ]; then
  curl -sSfL "$REL/$MODEL.tar.bz2" | tar xj -C models
fi
[ -f models/silero_vad.onnx ] || curl -sSfL -o models/silero_vad.onnx "$REL/silero_vad.onnx"
echo "Transcriptie klaar: npm run transcribe"
