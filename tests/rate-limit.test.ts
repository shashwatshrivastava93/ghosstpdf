import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows requests within the limit", () => {
    const ip = "192.168.1.1";
    const first = checkRateLimit(ip);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBeGreaterThan(0);
  });

  it("blocks after exceeding the limit", () => {
    const ip = "192.168.1.2";

    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip);
    }

    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks different IPs independently", () => {
    const ip1 = "10.0.0.1";
    const ip2 = "10.0.0.2";

    checkRateLimit(ip1);
    checkRateLimit(ip1);

    const result2 = checkRateLimit(ip2);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(9);
  });
});