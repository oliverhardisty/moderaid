import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    
    if (!text) {
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
    
    if (!azureApiKey || !azureEndpoint) {
      return new Response(
        JSON.stringify({ error: 'Azure Content Safety API configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const response = await fetch(`${azureEndpoint}/contentsafety/text:analyze?api-version=2023-10-01`, {
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

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.statusText}`)
    }

    const data = await response.json()

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

    return new Response(
      JSON.stringify(moderationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in Azure moderation:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})