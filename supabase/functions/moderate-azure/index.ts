import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Azure moderation function called');

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

    const azureApiKey = Deno.env.get('AZURE_MODERATION_API_KEY')
    const azureEndpoint = Deno.env.get('AZURE_MODERATION_ENDPOINT')
    
    console.log('Azure configuration check:', {
      apiKey: azureApiKey ? 'Key found' : 'Key missing',
      endpoint: azureEndpoint ? 'Endpoint found' : 'Endpoint missing'
    });
    
    if (!azureApiKey || !azureEndpoint) {
      console.log('Error: Azure Content Safety API configuration missing');
      return new Response(
        JSON.stringify({ 
          error: 'Azure Content Safety API configuration missing',
          details: `Missing: ${!azureApiKey ? 'API_KEY ' : ''}${!azureEndpoint ? 'ENDPOINT' : ''}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const apiUrl = `${azureEndpoint}/contentsafety/text:analyze?api-version=2023-10-01`;
    console.log('Making request to Azure API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
        haltOnBlocklistHit: false,
        outputType: 'FourSeverityLevels'
      }),
    })

    console.log('Azure API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Azure API error:', response.status, errorText);
      throw new Error(`Azure API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Azure API response received successfully');

    // Format the response for consistency
    const categories = []
    const categoryScores = {}
    let flagged = false

    if (data.categoriesAnalysis) {
      for (const analysis of data.categoriesAnalysis) {
        const category = analysis.category.toLowerCase()
        const severity = analysis.severity
        const score = severity / 6 // Normalize 0-6 scale to 0-1
        
        categoryScores[category] = score
        
        // Flag if severity is 2 or higher (medium, high)
        if (severity >= 2) {
          flagged = true
          categories.push(category)
        }
      }
    }

    const moderationResult = {
      flagged,
      categories,
      categoryScores,
      provider: 'azure',
      timestamp: new Date().toISOString(),
      rawResponse: data // Include raw response for debugging
    }

    console.log('Moderation result:', { flagged: moderationResult.flagged, categoriesCount: moderationResult.categories.length });

    return new Response(
      JSON.stringify(moderationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in Azure moderation:', error.message || error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})