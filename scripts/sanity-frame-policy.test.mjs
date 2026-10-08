import assert from "node:assert/strict";
import test from "node:test";

let importNumber = 0;

async function responseHeaders(studioUrl) {
  const previous = process.env.SANITY_STUDIO_URL;
  if (studioUrl === undefined) delete process.env.SANITY_STUDIO_URL;
  else process.env.SANITY_STUDIO_URL = studioUrl;

  try {
    const configUrl = new URL(`../next.config.ts?case=${importNumber++}`, import.meta.url);
    const { default: config } = await import(configUrl.href);
    const route = (await config.headers()).find(({ source }) => source === "/:path*");
    assert.ok(route, "expected the global response headers rule");
    return Object.fromEntries(route.headers.map(({ key, value }) => [key.toLowerCase(), value]));
  } finally {
    if (previous === undefined) delete process.env.SANITY_STUDIO_URL;
    else process.env.SANITY_STUDIO_URL = previous;
  }
}

function frameAncestors(headers) {
  const directive = headers["content-security-policy"]
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("frame-ancestors "));
  assert.ok(directive, "expected a frame-ancestors directive");
  return directive.split(/\s+/).slice(1);
}

for (const hostname of ["www.sanity.io", "sanity.io"]) {
  test(`allows both exact Sanity dashboard origins for a configured ${hostname} Studio`, async () => {
    const headers = await responseHeaders(`https://${hostname}/@o2aoecxqi/studio/g9tmzbgatl7rbaw15k97672f`);
    assert.deepEqual(frameAncestors(headers), ["'self'", "https://sanity.io", "https://www.sanity.io"]);
    assert.equal(headers["x-frame-options"], undefined);
    assert.doesNotMatch(headers["content-security-policy"], /\*\.sanity\.io|\*\.sanity\.studio/);
  });
}

test("allows only the exact configured hostname for a legacy sanity.studio deployment", async () => {
  const headers = await responseHeaders("https://santiersync.sanity.studio");
  assert.deepEqual(frameAncestors(headers), ["'self'", "https://santiersync.sanity.studio"]);
  assert.equal(headers["x-frame-options"], undefined);
});

for (const [label, url] of [
  ["an untrusted host", "https://evil.example/@o2aoecxqi/studio/g9tmzbgatl7rbaw15k97672f"],
  ["an HTTP dashboard URL", "http://sanity.io/@o2aoecxqi/studio/g9tmzbgatl7rbaw15k97672f"],
  ["a missing Studio URL", undefined],
]) {
  test(`denies framing for ${label}`, async () => {
    const headers = await responseHeaders(url);
    assert.deepEqual(frameAncestors(headers), ["'none'"]);
    assert.equal(headers["x-frame-options"], "DENY");
  });
}
