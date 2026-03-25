#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import https from "https";
import os from "os";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(os.homedir(), "Desktop", "gemini-outputs");
const FALLBACK_OUTPUT_DIR = path.join(os.homedir(), "Downloads");

function ensureOutputDir() {
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    return OUTPUT_DIR;
  } catch {
    fs.mkdirSync(FALLBACK_OUTPUT_DIR, { recursive: true });
    return FALLBACK_OUTPUT_DIR;
  }
}

function httpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 500)}`));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function pollOperation(operationName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_API_KEY}`;
  const maxAttempts = 120; // 10 minutes at 5s intervals
  for (let i = 0; i < maxAttempts; i++) {
    const res = await httpRequest(url, { method: "GET" });
    if (res.status !== 200) {
      throw new Error(`Poll failed (${res.status}): ${JSON.stringify(res.body)}`);
    }
    if (res.body.done) {
      return res.body;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Video generation timed out after 10 minutes");
}

const server = new McpServer({
  name: "gemini",
  version: "1.0.0",
});

server.tool(
  "gemini_generate_image",
  "Generate an image using Google Gemini Imagen 3. Returns the file path of the saved PNG image.",
  {
    prompt: z.string().describe("Text description of the image to generate"),
    aspectRatio: z
      .enum(["1:1", "3:4", "4:3", "9:16", "16:9"])
      .default("1:1")
      .describe("Aspect ratio of the generated image"),
  },
  async ({ prompt, aspectRatio }) => {
    if (!GEMINI_API_KEY) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GEMINI_API_KEY environment variable is not set. Please set it in your MCP server configuration.",
          },
        ],
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;
    const body = {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio },
    };

    const res = await httpRequest(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      body
    );

    if (res.status !== 200) {
      return {
        content: [
          {
            type: "text",
            text: `Error from Gemini API (${res.status}): ${JSON.stringify(res.body)}`,
          },
        ],
      };
    }

    const b64 = res.body?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) {
      return {
        content: [
          {
            type: "text",
            text: `Unexpected response format: ${JSON.stringify(res.body).slice(0, 500)}`,
          },
        ],
      };
    }

    const outDir = ensureOutputDir();
    const filename = `image_${Date.now()}.png`;
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, Buffer.from(b64, "base64"));

    return {
      content: [
        {
          type: "text",
          text: `Image saved to: ${filePath}`,
        },
      ],
    };
  }
);

server.tool(
  "gemini_generate_video",
  "Generate a video using Google Gemini Veo 2. Returns the file path of the saved MP4 video. This is a long-running operation that may take several minutes.",
  {
    prompt: z.string().describe("Text description of the video to generate"),
    durationSeconds: z
      .number()
      .int()
      .min(1)
      .max(8)
      .default(5)
      .describe("Duration of the video in seconds (1-8)"),
    aspectRatio: z
      .enum(["9:16", "16:9"])
      .default("16:9")
      .describe("Aspect ratio of the generated video"),
  },
  async ({ prompt, durationSeconds, aspectRatio }) => {
    if (!GEMINI_API_KEY) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GEMINI_API_KEY environment variable is not set. Please set it in your MCP server configuration.",
          },
        ],
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/veo-002:predictLongRunning?key=${GEMINI_API_KEY}`;
    const body = {
      instances: [{ prompt }],
      parameters: { durationSeconds, aspectRatio },
    };

    let res;
    try {
      res = await httpRequest(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        body
      );
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error calling Veo 2 API: ${err.message}. You may need to request API access at https://aistudio.google.com`,
          },
        ],
      };
    }

    if (res.status === 403 || res.status === 404) {
      return {
        content: [
          {
            type: "text",
            text: `Veo 2 API returned ${res.status}. Video generation may not be available for your account. Request access at https://aistudio.google.com\n\nDetails: ${JSON.stringify(res.body)}`,
          },
        ],
      };
    }

    if (res.status !== 200) {
      return {
        content: [
          {
            type: "text",
            text: `Error from Gemini API (${res.status}): ${JSON.stringify(res.body)}`,
          },
        ],
      };
    }

    const operationName = res.body?.name;
    if (!operationName) {
      return {
        content: [
          {
            type: "text",
            text: `Unexpected response (no operation name): ${JSON.stringify(res.body).slice(0, 500)}`,
          },
        ],
      };
    }

    let result;
    try {
      result = await pollOperation(operationName);
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error polling video generation: ${err.message}`,
          },
        ],
      };
    }

    const videoB64 =
      result?.response?.generateVideoResponse?.generatedSamples?.[0]
        ?.video?.bytesBase64Encoded;

    if (!videoB64) {
      return {
        content: [
          {
            type: "text",
            text: `Video generation completed but no video data found in response: ${JSON.stringify(result).slice(0, 500)}`,
          },
        ],
      };
    }

    const outDir = ensureOutputDir();
    const filename = `video_${Date.now()}.mp4`;
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, Buffer.from(videoB64, "base64"));

    return {
      content: [
        {
          type: "text",
          text: `Video saved to: ${filePath}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
