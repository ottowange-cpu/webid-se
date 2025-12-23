import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { domain, reason, category, risk_level } = await req.json();

    if (!domain) {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract domain from URL if full URL is provided
    let cleanDomain = domain;
    try {
      const urlObj = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      cleanDomain = urlObj.hostname;
    } catch {
      // If URL parsing fails, use the domain as-is
      cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }

    console.log(`Adding blocked domain: ${cleanDomain}`);

    // Insert or update the domain
    const { data, error } = await supabase
      .from('blocked_domains')
      .upsert({
        domain: cleanDomain,
        reason: reason || 'Marked as unsafe',
        category: category || 'unknown',
        risk_level: risk_level || 'high'
      }, {
        onConflict: 'domain'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding blocked domain:', error);
      throw error;
    }

    console.log(`Successfully added/updated domain: ${cleanDomain}`);

    return new Response(JSON.stringify({ 
      success: true, 
      domain: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in add-blocked-domain function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
