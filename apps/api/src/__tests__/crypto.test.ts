import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../crypto/encrypt.js";

describe("encrypt/decrypt", () => {
  const key = "a".repeat(64);

  it("round-trips a string", () => {
    const plaintext = "my-secret-password";
    const encrypted = encrypt(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(decrypt(encrypted, key)).toBe(plaintext);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plaintext = "test";
    const a = encrypt(plaintext, key);
    const b = encrypt(plaintext, key);
    expect(a).not.toBe(b);
  });
});
