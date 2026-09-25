const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH = 12; // 96 bits for GCM

export interface EncryptionResult {
  encryptedBlob: Blob;
  wrappedKeyHex: string;
  ivHex: string;
}

export async function encryptFile(file: File): Promise<EncryptionResult> {
  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));

  const rawKey = crypto.getRandomValues(new Uint8Array(32));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt"]
  );

  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    fileBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer], {
      type: "application/octet-stream",
    }),
    wrappedKeyHex: bufferToHex(rawKey),
    ivHex: bufferToHex(iv),
  };
}

export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  wrappedKeyHex: string,
  ivHex: string
): Promise<ArrayBuffer> {
  const rawKey = hexToBuffer(wrappedKeyHex);
  const iv = hexToBuffer(ivHex);
  const keyBuffer = rawKey.buffer.slice(
    rawKey.byteOffset,
    rawKey.byteOffset + rawKey.byteLength
  ) as ArrayBuffer;
  const ivBuffer = iv.buffer.slice(
    iv.byteOffset,
    iv.byteOffset + iv.byteLength
  ) as ArrayBuffer;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    cryptoKey,
    encryptedBuffer
  );

  // Zero out the key from memory
  rawKey.fill(0);

  return decrypted;
}

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
