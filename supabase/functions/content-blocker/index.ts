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

    // Get URL parameters
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'safari';

    console.log(`Fetching blocked domains, format: ${format}`);

    // Fetch all blocked domains
    const { data: domains, error } = await supabase
      .from('blocked_domains')
      .select('domain, reason, category, risk_level')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blocked domains:', error);
      throw error;
    }

    console.log(`Found ${domains?.length || 0} blocked domains`);

    if (format === 'safari') {
      // Generate Safari Content Blocker JSON format
      // https://developer.apple.com/documentation/safariservices/creating_a_content_blocker
      const contentBlockerRules = domains?.map((item) => ({
        trigger: {
          "url-filter": `.*${escapeRegex(item.domain)}.*`,
          "load-type": ["third-party", "first-party"]
        },
        action: {
          type: "block"
        }
      })) || [];

      return new Response(JSON.stringify(contentBlockerRules, null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        },
      });
    } else if (format === 'domains') {
      // Simple list of domains
      const domainList = domains?.map(d => d.domain) || [];
      
      return new Response(JSON.stringify({ 
        count: domainList.length,
        domains: domainList,
        updated_at: new Date().toISOString()
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      });
    } else if (format === 'hosts') {
      // Hosts file format (for DNS blocking)
      const hostsContent = domains?.map(d => `0.0.0.0 ${d.domain}`).join('\n') || '';
      
      return new Response(hostsContent, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/plain' 
        },
      });
    } else {
      // Full details
      return new Response(JSON.stringify({ 
        count: domains?.length || 0,
        domains: domains,
        updated_at: new Date().toISOString()
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      });
    }
  } catch (error) {
    console.error('Error in content-blocker function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Escape special regex characters in domain names
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
