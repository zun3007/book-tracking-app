import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fvsbyfmltmzdfykxiwhj.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2c2J5Zm1sdG16ZGZ5a3hpd2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzI4NDAsImV4cCI6MjA0ODIwODg0MH0.99MtQ_6uy1YWIksMFl7bKXggoEWG8PkqtUvjblwBIJk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
