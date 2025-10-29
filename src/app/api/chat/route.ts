import { NextRequest, NextResponse } from "next/server";
import { makeC1Response } from "@thesysai/genui-sdk/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const c1Response = makeC1Response();
  const response = await fetch(
    "http://localhost:5678/webhook/4fbeaffa-dc8c-4b6e-bb5b-bf7acbf6fa7b/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatInput: prompt }),
    }
  );

  const data = await response.json();
  c1Response.writeContent(data.output);
  c1Response.end();
  return new NextResponse(c1Response.responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
