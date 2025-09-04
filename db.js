import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://xumyuywtjlycshspntod.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(supabaseUrl, supabaseKey);

export default db;