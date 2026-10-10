import fs from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(16);
Config.setOverwriteOutput(true);

// Cloud-container: voorgeïnstalleerde headless shell gebruiken i.p.v. downloaden.
const headless = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (fs.existsSync(headless)) Config.setBrowserExecutable(headless);
