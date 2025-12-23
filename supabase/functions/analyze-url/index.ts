import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const domain = extractDomain(url);
    console.log('Analyzing URL:', url, 'Domain:', domain);

    // Check if domain is already in blocklist
    const { data: existingBlock } = await supabase
      .from('blocked_domains')
      .select('*')
      .eq('domain', domain)
      .maybeSingle();

    if (existingBlock) {
      console.log('Domain already blocked:', domain);
      return new Response(
        JSON.stringify({
          safe: false,
          riskLevel: existingBlock.risk_level || 'high',
          category: existingBlock.category || 'Blockerad',
          reasons: [existingBlock.reason || 'Denna domän är blockerad'],
          recommendation: 'Undvik denna webbplats - den har tidigare identifierats som osäker.',
          shouldBlock: true,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Du är en säkerhets-AI som analyserar webbsidor i realtid för att identifiera bedrägerier, phishing och andra osäkra hemsidor.

Ditt mål är att skydda användaren från att förlora pengar eller få personlig information stulen.

Analysera alltid följande signaler och kombinera dem till en riskbedömning:

1. URL & domän
- Domäner som imiterar kända företag (t.ex. paypaI istället för paypal)
- Extra ord i domänen som "secure", "verify", "login", "update"
- Ovanliga toppdomäner (.xyz, .top, .ru, .tk)
- Mycket nya eller nyligen registrerade domäner
- Långa eller slumpmässiga URL-strängar

2. Inloggning & formulär
- Sidor som ber om lösenord, BankID, personnummer, kortnummer eller CVC
- Formulär utan tydlig privacy-policy eller företagsinformation
- Inloggning krävs för att fortsätta eller låsa upp innehåll

3. Betalningar & erbjudanden
- Krav på förskottsbetalning
- Betalning via kryptovaluta, presentkort eller direktöverföring
- Erbjudanden som är "för bra för att vara sanna"
- Påståenden om vinster, återbetalningar eller kontoproblem

4. Psykologisk manipulation
- Stressande språk: "agera nu", "kontot stängs", "sista chansen"
- Hot eller tidsbegränsningar
- Rädsla för konsekvenser om användaren inte agerar

5. Företagsinformation
- Saknar organisationsnummer, adress eller telefonnummer
- Otydliga eller generiska företagsnamn
- Fejkade eller kopierade texter

6. Teknisk och visuell kvalitet
- HTTPS saknas eller certifikatproblem
- Omdirigeringar till andra domäner
- Popup-fönster som blockerar innehåll
- Stavfel, dålig översättning eller lågkvalitativa logotyper

7. Social proof
- Fejkade recensioner
- Endast 5-stjärniga omdömen utan detaljer
- Samma recensionstext upprepas

8. Tekniskt beteende
- Script som kan läsa tangenttryckningar eller formulärdata
- Dolda iframes eller misstänkta externa script

VIKTIGT: Om flera högrisk-signaler upptäcks (phishing, betalningsbedrägerier, manipulation), sätt riskLevel till "high" och safe till false. Sidan ska blockeras.

Svara ENDAST med ett JSON-objekt i följande format:
{
  "safe": true/false,
  "riskLevel": "low" | "medium" | "high",
  "category": "Legitimt" | "Phishing" | "Bedrägeri" | "Misstänkt" | "Okänt",
  "reasons": ["anledning 1", "anledning 2"],
  "recommendation": "kort rekommendation till användaren",
  "shouldBlock": true/false
}`
          },
          {
            role: 'user',
            content: `Analysera denna URL: ${url}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysis = {
        safe: false,
        riskLevel: 'medium',
        category: 'Okänt',
        reasons: ['Kunde inte analysera URL:en fullständigt'],
        recommendation: 'Var försiktig med denna webbplats'
      };
    }

    // If the URL is unsafe, add it to the blocklist
    if (!analysis.safe && (analysis.riskLevel === 'high' || analysis.shouldBlock)) {
      console.log('Adding unsafe domain to blocklist:', domain);
      
      const { error: insertError } = await supabase
        .from('blocked_domains')
        .upsert({
          domain: domain,
          reason: analysis.reasons?.join('. ') || 'Identifierad som osäker',
          category: analysis.category || 'unknown',
          risk_level: analysis.riskLevel || 'high'
        }, {
          onConflict: 'domain'
        });

      if (insertError) {
        console.error('Error adding to blocklist:', insertError);
      } else {
        console.log('Successfully added to blocklist:', domain);
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-url function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});