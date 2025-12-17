import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const { data: existingIp, error: lookupError } = await supabase
      .from('user_ip_addresses')
      .select('user_email')
      .eq('ip_address', clientIp)
      .maybeSingle();

    let userEmail: string;
    let password: string;

    if (existingIp) {
      userEmail = existingIp.user_email;
      
      await supabase
        .from('user_ip_addresses')
        .update({ last_seen: new Date().toISOString() })
        .eq('ip_address', clientIp);
      
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData.users.find(u => u.email === userEmail);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { data: sessionData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail,
      });

      if (tokenError) {
        throw tokenError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          email: userEmail,
          access_token: sessionData.properties.access_token,
          refresh_token: sessionData.properties.refresh_token,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      userEmail = `user_${clientIp.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}@auto-login.local`;
      password = crypto.randomUUID();

      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          auto_generated: true,
          ip_address: clientIp
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      await supabase
        .from('user_ip_addresses')
        .insert({
          ip_address: clientIp,
          user_email: userEmail,
          metadata: {
            user_agent: req.headers.get('user-agent'),
            created_by: 'auto-login'
          }
        });

      const { data: sessionData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail,
      });

      if (tokenError) {
        throw tokenError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          email: userEmail,
          access_token: sessionData.properties.access_token,
          refresh_token: sessionData.properties.refresh_token,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    console.error('Auto-login error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});