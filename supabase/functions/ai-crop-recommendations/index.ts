
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, soilType, previousCrops, season } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const weatherApiKey = Deno.env.get('WEATHER_API_KEY');
    let weatherData = {};
    
    // Get weather data if API key is available
    if (weatherApiKey) {
      try {
        const weatherResponse = await fetch(`http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${location}`);
        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json();
        }
      } catch (error) {
        console.log('Weather API error, continuing without weather data:', error);
      }
    }

    // Create AI prompt for crop recommendations
    const prompt = `As an agricultural expert, recommend the best crops to plant based on:
    Location: ${location}
    Current Weather: ${weatherData.current?.condition?.text || 'Unknown'}, ${weatherData.current?.temp_c || 'Unknown'}°C
    Soil Type: ${soilType}
    Previous Crops: ${previousCrops?.join(', ') || 'None specified'}
    Season: ${season}
    
    Please provide exactly 3 specific crop recommendations. Format your response as a valid JSON array with objects containing:
    - crop: the name of the crop
    - reason: detailed explanation (2-3 sentences)
    - confidence: a number between 0 and 1
    
    Example format:
    [
      {"crop": "Rice", "reason": "Suitable for monsoon season with high water availability.", "confidence": 0.85},
      {"crop": "Wheat", "reason": "Good for winter cultivation in this soil type.", "confidence": 0.78}
    ]`;

    console.log('Sending request to OpenAI...');
    
    let recommendations;
    
    try {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert agricultural advisor specializing in Indian farming. Always respond with valid JSON format.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (aiResponse.status === 429) {
        console.log('OpenAI rate limit hit, using fallback recommendations');
        // Provide fallback recommendations when rate limited
        recommendations = [
          {
            crop: "Rice",
            reason: `Suitable for ${season} season in ${location}. Rice is well-adapted to ${soilType} soil conditions and is a staple crop in the region.`,
            confidence: 0.75
          },
          {
            crop: "Wheat",
            reason: `Good alternative for crop rotation after ${previousCrops?.join(', ') || 'previous crops'}. Wheat performs well in diverse soil types and weather conditions.`,
            confidence: 0.70
          },
          {
            crop: "Vegetables",
            reason: `High-value vegetables are suitable for local market conditions and provide good returns in ${location}.`,
            confidence: 0.65
          }
        ];
      } else if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`OpenAI API error: ${aiResponse.status} ${aiResponse.statusText}`, errorText);
        throw new Error(`OpenAI API error: ${aiResponse.status} ${aiResponse.statusText}`);
      } else {
        const aiData = await aiResponse.json();
        console.log('OpenAI response received:', aiData);

        if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
          throw new Error('Invalid response structure from OpenAI');
        }

        try {
          const content = aiData.choices[0].message.content;
          console.log('AI content:', content);
          recommendations = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // Fallback recommendations if parsing fails
          recommendations = [
            {
              crop: "Rice",
              reason: "Suitable for the specified location and season with good water management.",
              confidence: 0.7
            },
            {
              crop: "Wheat",
              reason: "Good alternative crop for rotation and soil health maintenance.",
              confidence: 0.65
            },
            {
              crop: "Vegetables",
              reason: "High-value crops suitable for local market conditions.",
              confidence: 0.6
            }
          ];
        }
      }
    } catch (fetchError) {
      console.error('Error calling OpenAI API:', fetchError);
      
      // Check if it's a rate limit error specifically
      if (fetchError.message?.includes('429')) {
        console.log('Rate limit detected, using fallback recommendations');
        recommendations = [
          {
            crop: "Rice",
            reason: `Recommended for ${season} season in ${location}. This crop is well-suited to local conditions and ${soilType} soil.`,
            confidence: 0.75
          },
          {
            crop: "Maize",
            reason: `Good option for crop diversification after ${previousCrops?.join(', ') || 'previous cultivation'}. Maize adapts well to various soil conditions.`,
            confidence: 0.70
          },
          {
            crop: "Pulses",
            reason: `Beneficial for soil nitrogen fixation and provides good market value in ${location}.`,
            confidence: 0.68
          }
        ];
      } else {
        throw fetchError; // Re-throw if it's not a rate limit error
      }
    }

    // Ensure recommendations is an array
    if (!Array.isArray(recommendations)) {
      recommendations = [recommendations];
    }

    // Store recommendations in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Storing recommendations for user:', user.id);
    for (const rec of recommendations) {
      await supabase.from('crop_recommendations').insert({
        user_id: user.id,
        recommended_crop: rec.crop,
        reason: rec.reason,
        confidence_score: rec.confidence,
        weather_data: weatherData,
        soil_data: { type: soilType, location }
      });
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-crop-recommendations:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate recommendations';
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      errorMessage = 'AI service is temporarily busy. Please try again in a few minutes.';
    } else if (error.message?.includes('API key')) {
      errorMessage = 'AI service configuration issue. Please contact support.';
    } else if (error.message?.includes('Unauthorized')) {
      errorMessage = 'Authentication required. Please log in again.';
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
