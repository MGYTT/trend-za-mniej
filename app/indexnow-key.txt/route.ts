import {
  getIndexNowConfig,
} from "@/lib/indexnow";

export const dynamic =
  "force-dynamic";

export function GET() {
  const config =
    getIndexNowConfig();

  if (
    !config.validKey
  ) {
    return new Response(
      "Not Found",
      {
        status:
          404,

        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",

          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  return new Response(
    config.key,
    {
      status:
        200,

      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",

        "Cache-Control":
          "public, max-age=3600",
      },
    }
  );
}