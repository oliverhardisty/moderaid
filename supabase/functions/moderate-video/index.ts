// Supabase Edge Function: moderate-video
// Uses Google Cloud Video Intelligence API to analyze videos for safety signals

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function log(...args: unknown[]) {
  console.log('[moderate-video]', ...args);
}

// Map Google likelihood enum to numeric score
const likelihoodToScore: Record<string, number> = {
  UNKNOWN: 0.5,
  VERY_UNLIKELY: 0.05,
  UNLIKELY: 0.15,
  POSSIBLE: 0.4,
  LIKELY: 0.75,
  VERY_LIKELY: 0.95,
};

// Utility: wait ms
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Google OAuth2 Service Account helpers
// Minimal helpers to obtain an access token using a service account (JWT flow)
type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64UrlFromArrayBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(pem);
  return await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function base64UrlEncodeString(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return base64UrlFromArrayBuffer(data.buffer);
}

async function signJwtRS256(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKeyPem: string
): Promise<string> {
  const headerB64 = base64UrlEncodeString(JSON.stringify(header));
  const payloadB64 = base64UrlEncodeString(JSON.stringify(payload));
  const toSign = `${headerB64}.${payloadB64}`;
  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(toSign)
  );
  const sigB64 = base64UrlFromArrayBuffer(signature);
  return `${toSign}.${sigB64}`;
}

async function getGoogleAccessTokenFromServiceAccount(
  sa: ServiceAccount,
  scope: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = sa.token_uri || 'https://oauth2.googleapis.com/token';
  const jwt = await signJwtRS256(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: sa.client_email,
      scope,
      aud: tokenUri,
      iat: now,
      exp: now + 3600,
    },
    sa.private_key
  );

  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to obtain Google access token: ${json.error || res.statusText}`);
  }
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const saRaw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!saRaw) {
      log('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: GOOGLE_SERVICE_ACCOUNT_JSON not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(saRaw);
    } catch (e) {
      log('Invalid GOOGLE_SERVICE_ACCOUNT_JSON', String(e));
      return new Response(
        JSON.stringify({ error: 'Invalid GOOGLE_SERVICE_ACCOUNT_JSON', details: String(e) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = await getGoogleAccessTokenFromServiceAccount(
      serviceAccount,
      'https://www.googleapis.com/auth/cloud-platform'
    );
    const body = await req.json().catch(() => ({}));
    const { gcsUri, videoUrl, inputContentB64, features } = body as {
      gcsUri?: string;
      videoUrl?: string;
      inputContentB64?: string;
      features?: string[];
    };

    log('Request body received', { gcsUri, videoUrl, hasInputContent: !!inputContentB64, features });

    if (!gcsUri && !videoUrl && !inputContentB64) {
      return new Response(
        JSON.stringify({ error: 'Provide either gcsUri (gs://bucket/object), inputContentB64, or videoUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let effectiveInput: { inputUri?: string; inputContent?: string } = {};

    if (gcsUri) {
      effectiveInput.inputUri = gcsUri;
    } else if (inputContentB64) {
      effectiveInput.inputContent = inputContentB64;
    } else if (videoUrl) {
      try {
        const u = new URL(videoUrl);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
          return new Response(
            JSON.stringify({ error: 'Server cannot access localhost URLs. Upload the video or send inputContentB64 instead.', code: 'LOCALHOST_UNREACHABLE' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
          return new Response(
            JSON.stringify({
              error: 'YouTube URLs are not supported directly. Provide a GCS URI (gs://) or upload a direct video file so we can analyze bytes.',
              code: 'YOUTUBE_URL_NOT_SUPPORTED'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Fetch remote video and convert to base64
        const res = await fetch(videoUrl, { method: 'GET' });
        if (!res.ok) {
          log('Failed to fetch video', { status: res.status, statusText: res.statusText, url: videoUrl });
          return new Response(
            JSON.stringify({ error: 'Failed to fetch video from URL', status: res.status, statusText: res.statusText }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const arrayBuf = await res.arrayBuffer();
        log(`Video size: ${arrayBuf.byteLength} bytes`);

        // Reject very large files to prevent timeouts/memory pressure
        const maxBytes = 20 * 1024 * 1024; // 20MB
        if (arrayBuf.byteLength > maxBytes) {
          return new Response(
            JSON.stringify({ error: 'Video too large', maxBytes, actualBytes: arrayBuf.byteLength }),
            { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Base64 encode using safe chunking to avoid stack overflow
        const uint8Array = new Uint8Array(arrayBuf);
        let binary = '';
        const chunkSize = 0x8000; // 32KB
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binary);
        effectiveInput.inputContent = base64;
        effectiveInput.inputContent = base64;
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid or unreachable videoUrl', details: String(e) }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!effectiveInput.inputUri && !effectiveInput.inputContent) {
      return new Response(
        JSON.stringify({ error: 'No valid input provided for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = {
      ...effectiveInput,
      features:
        features ?? [
          'EXPLICIT_CONTENT_DETECTION',
          'LABEL_DETECTION',
          'SHOT_CHANGE_DETECTION',
          'TEXT_DETECTION',
        ],
      // You can tune videoContext if needed in future iterations
    } as Record<string, unknown>;

    log('Submitting annotate request to Google Video Intelligence');

    const annotateRes = await fetch(
      `https://videointelligence.googleapis.com/v1/videos:annotate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const annotateJson = await annotateRes.json();
    if (!annotateRes.ok) {
      log('Annotate request failed', annotateJson);
      return new Response(JSON.stringify({ error: 'Google API error', details: annotateJson }), {
        status: annotateRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const operationName = annotateJson.name as string;
    log('Operation started', operationName);

    // Poll operation until done
    let responseJson: any | null = null;
    const maxAttempts = 40; // ~2 minutes max if 3s interval
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const opRes = await fetch(
        `https://videointelligence.googleapis.com/v1/${encodeURIComponent(operationName)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const opJson = await opRes.json();

      if (opJson.done) {
        if (opJson.error) {
          log('Operation completed with error', opJson.error);
          return new Response(
            JSON.stringify({ error: 'Google operation error', details: opJson.error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        responseJson = opJson.response;
        break;
      }
      await sleep(3000);
    }

    if (!responseJson) {
      log('Operation timed out');
      return new Response(
        JSON.stringify({ error: 'Timed out waiting for analysis results' }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse results
    const annotation = responseJson.annotationResults?.[0] ?? {};

    const categories: string[] = [];
    const categoryScores: Record<string, number> = {};
    let flagged = false;

    // Explicit content
    if (annotation.explicitAnnotation?.frames?.length) {
      let maxExplicitScore = 0;
      for (const f of annotation.explicitAnnotation.frames) {
        const likelihood: string = f.pornographyLikelihood ?? 'UNKNOWN';
        const score = likelihoodToScore[likelihood] ?? 0.0;
        if (score > maxExplicitScore) maxExplicitScore = score;
      }
      categoryScores['sexual_explicit'] = Number(maxExplicitScore.toFixed(3));
      if (maxExplicitScore >= 0.75) {
        categories.push('sexual_explicit');
        flagged = true;
      }
    }

    // Labels (segment or shot)
    const allLabelGroups = [
      ...(annotation.segmentLabelAnnotations ?? []),
      ...(annotation.shotLabelAnnotations ?? []),
    ];

    const interestingSignals = [
      { match: 'violence', category: 'violence' },
      { match: 'weapon', category: 'weapons' },
      { match: 'blood', category: 'graphic_content' },
      { match: 'fight', category: 'violence' },
    ];

    for (const label of allLabelGroups) {
      const name: string = label.entity?.description?.toLowerCase?.() ?? '';
      const segs = (label.segments ?? []) as Array<{ confidence?: number }>;
      const maxConf = segs.reduce((m, s) => Math.max(m, Number(s.confidence ?? 0)), 0);

      for (const sig of interestingSignals) {
        if (name.includes(sig.match)) {
          const prev = categoryScores[sig.category] ?? 0;
          categoryScores[sig.category] = Number(Math.max(prev, maxConf).toFixed(3));
          if (maxConf >= 0.7 && !categories.includes(sig.category)) {
            categories.push(sig.category);
            flagged = true;
          }
        }
      }
    }

    // Text detection (e.g., profanity on screen)
    if (annotation.textAnnotations?.length) {
      // We don't parse the full text here, but note presence for future rules
      categoryScores['on_screen_text'] = 0.5;
    }

    const result = {
      flagged,
      categories: Array.from(new Set(categories)),
      categoryScores,
      provider: 'google_video_intelligence',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    log('Unhandled error', e);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
