import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uyhrldqxlohdsnianxex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cVlKDf5nwFEwej2dVJSoTw_tVYrEcHI' ;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
