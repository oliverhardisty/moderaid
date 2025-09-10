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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    if (!apiKey) {
      log('Missing GOOGLE_CLOUD_API_KEY');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: GOOGLE_CLOUD_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        // Fetch remote video and convert to base64
        const res = await fetch(videoUrl);
        if (!res.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch video from URL' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const arrayBuf = await res.arrayBuffer();
        // Base64 encode using chunked approach to avoid stack overflow
        const uint8Array = new Uint8Array(arrayBuf);
        let binary = '';
        const chunkSize = 0x8000; // 32KB chunks
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binary);
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
      `https://videointelligence.googleapis.com/v1/videos:annotate?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        `https://videointelligence.googleapis.com/v1/${encodeURIComponent(
          operationName
        )}?key=${encodeURIComponent(apiKey)}`
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
