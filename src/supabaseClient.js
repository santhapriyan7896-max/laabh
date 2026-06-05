import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zlufxxyxgjonntyxazai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdWZ4eHl4Z2pvbm50eXhhemFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzExNzYsImV4cCI6MjA5NjI0NzE3Nn0.j8FuMy2a_HWj6x4W63Zep-G-BHLIYESrYiaCrgOzduo'

export const supabase = createClient(supabaseUrl, supabaseKey)