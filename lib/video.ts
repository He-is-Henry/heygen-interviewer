async function pollVideo(videoId: string) {
  let attempts = 0;

  while (attempts < 3) {
    await new Promise((r) => setTimeout(r, 3000));

    try {
      const res = await fetch(
        `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
        {
          headers: {
            "X-Api-Key": process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
          },
        }
      );

      if (!res.ok) {
        console.log("Polling failed:", res.status);
        return null;
      }

      const data = await res.json();
      console.log("STATUS:", data);

      const status = data?.data?.status;

      if (status === "completed") {
        return data?.data?.video_url;
      }

      if (status === "failed") {
        return null;
      }

    } catch (err) {
      console.log("Polling error:", err);
      return null;
    }

    attempts++;
  }

  return null;
}

export async function generateMayaVideo(text: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
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
    const videoId = data?.data?.video_id;

    if (!videoId) return null;

    const videoUrl = await pollVideo(videoId);

    return videoUrl ?? null;
  } catch {
    return null;
  }
}