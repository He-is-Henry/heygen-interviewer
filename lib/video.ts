async function pollVideo(videoId: string): Promise<string | null> {
  const MAX_ATTEMPTS = 30;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    try {
      const res = await fetch(
        `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
        {
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
          },
        }
      );

      const data = await res.json();
      console.log(`[HeyGen] Poll attempt ${i + 1}:`, data?.data?.status, data);

      const status = data?.data?.status;
      if (status === "completed") {
        const url = data?.data?.video_url || data?.data?.url;
        console.log("[HeyGen] Video ready:", url);
        return url ?? null;
      }
      if (status === "failed") {
        console.error("[HeyGen] Video failed:", data);
        return null;
      }
    } catch (err) {
      console.error("[HeyGen] Poll error:", err);
      return null;
    }
  }

  console.warn("[HeyGen] Timed out after", MAX_ATTEMPTS, "attempts");
  return null;
}

export async function generateMayaVideo(text: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;

  if (!apiKey) {
    console.error("[HeyGen] API key is missing");
    return null;
  }

  console.log("[HeyGen] Generating video for:", text.slice(0, 60));

  try {
    const res = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: "Daisy-inskirt-20220818",
            },
            voice: {
              type: "text",
              input_text: text,
              voice_id: "vakjM0uzzAxU4UiT0433",
            },
            background: {
              type: "color",
              value: "#0d0d0f",
            },
          },
        ],
      }),
    });

    const data = await res.json();
    console.log("[HeyGen] Generate response:", data);

    const videoId = data?.data?.video_id;
    if (!videoId) {
      console.error("[HeyGen] No video_id returned:", data);
      return null;
    }

    console.log("[HeyGen] Polling video_id:", videoId);
    return await pollVideo(videoId);
  } catch (err) {
    console.error("[HeyGen] Generate error:", err);
    return null;
  }
}