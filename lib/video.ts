import crypto from "crypto";

/**
 * Generates a short-lived, signed Bunny Stream playback URL so that:
 *  - the link stops working after `expiresInSeconds`
 *  - it only plays when embedded on our own domain (configured in the
 *    Bunny Stream dashboard alongside the signing key)
 * This is what actually protects the client's copyrighted course content —
 * a plain public video URL would let anyone reshare it.
 */
export async function getSignedPlaybackUrl(
  videoId: string,
  expiresInSeconds = 3600
): Promise<string> {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!;
  const signingKey = process.env.BUNNY_STREAM_SIGNING_KEY!;
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const hashableBase = signingKey + videoId + expires;
  const token = crypto.createHash("sha256").update(hashableBase).digest("hex");

  return `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
}
