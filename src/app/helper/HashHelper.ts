import * as CryptoJS from "crypto-js";
import crypto from "crypto";
import { AES_KEY } from "../constants/applicationConstants";

export async function encryptAES5(key: string, data: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for 128-bit IV
  const encodedKey = new TextEncoder().encode(key);
  const encodedData = new TextEncoder().encode(data);

  const subtleCrypto = window.crypto.subtle;
  const encryptedBuffer = await subtleCrypto.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    await subtleCrypto.importKey(
      "raw",
      encodedKey,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    ),
    encodedData
  );

  // Convert the Uint8Array to a regular array
  const ivArray = Array.from(iv);
  const encryptedDataArray = Array.from(new Uint8Array(encryptedBuffer));

  // Combine IV and encrypted data into a single array
  const combinedArray = ivArray.concat(encryptedDataArray);

  // Convert the combined array to a Base64-encoded string
  const encryptedOutput = btoa(String.fromCharCode.apply(null, combinedArray));
  return encryptedOutput;
}

const generateRandomIV = (): CryptoJS.lib.WordArray => {
  const ivSize = 16; // 16 bytes for AES encryption (128 bits)
  const iv = CryptoJS.lib.WordArray.random(ivSize);
  return iv;
};

// const key: string = "BJBXPoldaAESKeys";
const ivG: CryptoJS.lib.WordArray = generateRandomIV();

const fixedIV = CryptoJS.lib.WordArray.create([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]);

// export const encryptEx = (input: string): string => {
//   const encryptedValue: string = CryptoJS.AES.encrypt(
//     input,
//     CryptoJS.enc.Utf8.parse(key),
//     {
//       mode: CryptoJS.mode.ECB,
//       padding: CryptoJS.pad.Pkcs7,
//     }
//   ).toString();

//   return encryptedValue;
// };

export function encryptEXT(key: string, data: string): string {
  const hexKey = CryptoJS.enc.Hex.parse(
    CryptoJS.enc.Utf8.parse(key).toString(CryptoJS.enc.Hex)
  );

  const iv = CryptoJS.enc.Hex.parse("0000000000000000"); // 16 characters for 128-bit IV

  const encrypted = CryptoJS.AES.encrypt(data, hexKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

export function encryptAES2(data: string): string {
  const key = "BJBXPoldaAESKeys";

  const iv = CryptoJS.enc.Hex.parse("0000000000000000"); // 16 characters for 128-bit IV
  const fixedIV2 = CryptoJS.lib.WordArray.create([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);

  const hexKey = CryptoJS.enc.Hex.parse(
    CryptoJS.enc.Utf8.parse(key).toString(CryptoJS.enc.Hex)
  );

  // console.log(hexKey);

  // Encode the input string as UTF-8 before encryption
  const utf8Data = CryptoJS.enc.Utf8.parse(data);

  // Encrypt the data and cast the output to CipherParams type
  const encryptedData: CryptoJS.lib.CipherParams = CryptoJS.AES.encrypt(
    utf8Data,
    hexKey,
    {
      iv: iv, // Using a fixed IV for demonstration purposes
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ) as CryptoJS.lib.CipherParams; // Explicitly cast to CipherParams

  // Convert the CipherParams object to a Base64 string
  const base64String = CryptoJS.enc.Base64.stringify(encryptedData.ciphertext);
  return base64String;
}

export function encryptAES(data: string): string {
  const hexKey = CryptoJS.enc.Utf8.parse(AES_KEY);
  const ivX = CryptoJS.enc.Utf8.parse("0000000000000000");
  const encrypted = CryptoJS.AES.encrypt(data, hexKey, {
    iv: ivX,
    mode: CryptoJS.mode.CBC, // Use appropriate mode, e.g., ECB or CBC
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decryptAES(encryptedData: string): string {
  const hexKey = CryptoJS.enc.Utf8.parse(AES_KEY);
  const ivX = CryptoJS.enc.Utf8.parse("0000000000000000");
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, hexKey, {
    iv: ivX,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decryptedBytes.toString(CryptoJS.enc.Utf8);
}

export function generateStringToSign(
  httpMethod: string,
  relativeUrl: string,
  accessToken: string,
  requestBody: string,
  timestamp: string
): string {
  const encodedBody = CryptoJS.SHA256(requestBody)
    .toString(CryptoJS.enc.Hex)
    .toLowerCase();
  return `${httpMethod}:${relativeUrl}:${accessToken}:${encodedBody}:${timestamp}`;
}

// Step 1
export function getRequestBodyHash(requestBody: string): string {
  // Ensure the request body is always a string
  const bodyString =
    typeof requestBody === "string" ? requestBody : JSON.stringify(requestBody);
  const hash = CryptoJS.SHA256(bodyString).toString(CryptoJS.enc.Hex);
  return hash.toLowerCase(); // Convert to lowercase for consistency
}

// Step 2
export function jsonStringifySingleLine<T>(obj: T | null): string {
  if (obj === null) {
    return ""; // Return empty string if null
  }
  // Convert the object to JSON string
  const jsonString = JSON.stringify(obj);
  // Replace whitespace and format for single line
  return jsonString.replace(/\s/g, "").replace(/:/g, ":"); // Removed unnecessary comma replacement for null case
}

// step 3
export function generateStringToSignHash(
  httpMethod: string,
  relativeUrl: string,
  accessToken: string,
  requestBody: string,
  timestamp: string
): string {
  return `${httpMethod}:${relativeUrl}:${accessToken}:${requestBody}:${timestamp}`;
}

// Step 4
export function generateSignature(
  apiSecret: string,
  stringToSign: string
): string {
  const hmac = CryptoJS.HmacSHA256(stringToSign, apiSecret);
  return hmac.toString(CryptoJS.enc.Hex);
}

// ----------------------------------------------------------- AES-GCM

export interface EncryptedResult {
  iv: string; // Initialization vector (Base64)
  ciphertext: string; // Encrypted message (Base64)
  tag: string; // Authentication tag (Base64)
}
