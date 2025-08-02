# Environment Setup Guide

## Setting up your Supabase credentials

1. **Create a `.env` file** in the root directory of your project:
   ```bash
   # In the Expentia directory
   touch .env
   ```

2. **Add your Supabase anon key** to the `.env` file:
   ```env
   SUPABASE_KEY=your_supabase_anon_key_here
   ```

3. **Get your Supabase anon key**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "anon public" key (not the service role key)
   - Replace `your_supabase_anon_key_here` with your actual key

4. **Example `.env` file**:
   ```env
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eHFlc3RqZ2VsdGVheWFkamxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY5NzQ0MDAsImV4cCI6MTk5MjU1MDQwMH0.example_key_here
   ```

## Important Notes

- The `.env` file is already added to `.gitignore` to keep your keys secure
- Never commit your actual Supabase keys to version control
- The Supabase URL is already configured in the code
- Restart your development server after adding the `.env` file

## Testing the Connection

Once you've added your Supabase key, you can test the connection by:

1. Starting the development server: `npm start`
2. Opening the app on your device/simulator
3. Trying to sign in (the app will show an error if the connection fails)

## Troubleshooting

If you see a warning about the SUPABASE_KEY not being set:
- Make sure the `.env` file is in the root directory
- Check that the key is correctly formatted
- Restart the development server
- Clear the Metro cache: `npx expo start --clear` 