import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('OpenAI moderation function called');

  try {
    const { text } = await req.json()
    console.log('Received text for analysis:', text ? 'Text provided' : 'No text');
    
    if (!text) {
      console.log('Error: No text provided');
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('OpenAI API Key check:', openaiApiKey ? 'Key found' : 'Key missing');
    
    if (!openaiApiKey) {
      console.log('Error: OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
      }),
    })

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI API response received successfully');
    const result = data.results[0]

    // Format the response for consistency
    const moderationResult = {
      flagged: result.flagged,
      categories: Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category),
      categoryScores: result.category_scores,
      provider: 'openai',
      timestamp: new Date().toISOString()
    }

    console.log('Moderation result:', { flagged: moderationResult.flagged, categoriesCount: moderationResult.categories.length });

    return new Response(
      JSON.stringify(moderationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in OpenAI moderation:', error.message || error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})