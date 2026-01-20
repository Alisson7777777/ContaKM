
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdctfporhnbcfhzqcdlh.supabase.co';
const supabaseAnonKey = 'sb_publishable_y4vo302dYM8vl8N8edZdwA_wdtMai-Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
