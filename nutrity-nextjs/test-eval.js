const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pxkeyvmolfshembawelw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4a2V5dm1vbGZzaGVtYmF3ZWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzUyMDYsImV4cCI6MjA5MzQxMTIwNn0.NKGDhBAcaG3kGJGYJ5s_AWOAuc5VCyRWFSLdFACEQ9Y'
);

async function test() {
  const { data, error } = await supabase
    .from('Evaluation')
    .select('*')
    .eq('userId', '2f8b4607-2291-4ee3-981e-841344b8b19d')
    .limit(1)
    .maybeSingle();
  console.log('Result:', data, error);
}

test();
