export interface HMACSignature {
  signature: string;
  timestamp: string;
}

export async function generateHMACSignature(
  method: string,
  path: string,
  body: string | undefined,
  secret: string
): Promise<HMACSignature> {
  const timestamp = Date.now().toString();

  // Create body hash (empty string if no body)
  let bodyHash = '';
  if (body) {
    const encoder = new TextEncoder();
    const data = encoder.encode(body);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    bodyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Create message to sign
  const message = `${method}:${path}:${timestamp}:${bodyHash}`;

  // Generate HMAC signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { signature, timestamp };
}
