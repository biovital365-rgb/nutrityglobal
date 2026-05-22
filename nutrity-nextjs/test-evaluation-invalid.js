const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pxkeyvmolfshembawelw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4a2V5dm1vbGZzaGVtYmF3ZWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzUyMDYsImV4cCI6MjA5MzQxMTIwNn0.NKGDhBAcaG3kGJGYJ5s_AWOAuc5VCyRWFSLdFACEQ9Y'
);

async function test() {
  const { data, error } = await supabase
    .from('Evaluation')
    .select('*')
    .eq('userId', '109wzu6nc2asy');
  console.log('Result:', data, 'Error:', error);
}

test();
