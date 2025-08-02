import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dwxqestjgelteayadjlh.supabase.co';

// Try to get the key from environment variables
let supabaseKey;
try {
  // Try to import from @env
  const { SUPABASE_KEY } = require('@env');
  supabaseKey = SUPABASE_KEY;
  console.log('✅ Supabase key loaded from @env');
} catch (error) {
  console.log('⚠️ Could not load from @env, trying process.env');
  // Fallback to process.env
  supabaseKey = process.env.SUPABASE_KEY;
}

// Validate environment variable
if (!supabaseKey) {
  console.warn('❌ SUPABASE_KEY environment variable is not set.');
  console.warn('📝 Please ensure your .env file contains: SUPABASE_KEY=your_key_here');
  console.warn('🔄 Try restarting the development server with: npx expo start --clear');
  // Use a placeholder key to prevent the app from crashing
  supabaseKey = 'placeholder_key_for_development';
} else {
  console.log('✅ Supabase key is properly configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, fullName) => {
    try {
      console.log('Creating user with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { data: null, error };
      }
      
      // Create user profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              // No default budget - user will set it manually
            }
          ]);
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          console.log('✅ User profile created successfully');
        }
      }
      
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      console.log('Signing in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Get current user error:', error);
        return { data: { user: null }, error };
      }
      return { data, error };
    } catch (error) {
      console.error('Get current user error:', error);
      return { data: { user: null }, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Auth state change error:', error);
      return { data: { subscription: null }, error };
    }
  },
};

// Database helper functions
export const db = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      return { data, error };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  },

  // Update user budget
  updateUserBudget: async (userId, budget) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ monthly_budget: budget })
        .eq('id', userId);
      return { data, error };
    } catch (error) {
      console.error('Update user budget error:', error);
      return { data: null, error };
    }
  },

  // Create user profile
  createUserProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData]);
      return { data, error };
    } catch (error) {
      console.error('Create user profile error:', error);
      return { data: null, error };
    }
  },

  // Budget functions
  // Create a new budget
  createBudget: async (userId, budgetData) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          user_id: userId,
          name: budgetData.name,
          amount: budgetData.amount,
          category: budgetData.category || null,
          start_date: budgetData.startDate,
          end_date: budgetData.endDate,
        }]);
      return { data, error };
    } catch (error) {
      console.error('Create budget error:', error);
      return { data: null, error };
    }
  },

  // Get user budgets
  getUserBudgets: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Get user budgets error:', error);
      return { data: null, error };
    }
  },

  // Get budget usage using the database function
  getBudgetUsage: async (userId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_budget_usage', { p_user_id: userId });
      return { data, error };
    } catch (error) {
      console.error('Get budget usage error:', error);
      // Return empty data if function doesn't exist yet
      return { data: [], error: null };
    }
  },

  // Get budget alerts
  getBudgetAlerts: async (userId) => {
    try {
      const { data, error } = await supabase
        .rpc('check_budget_alerts', { p_user_id: userId });
      return { data, error };
    } catch (error) {
      console.error('Get budget alerts error:', error);
      // Return empty data if function doesn't exist yet
      return { data: [], error: null };
    }
  },

  // Update budget
  updateBudget: async (budgetId, updates) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', budgetId);
      return { data, error };
    } catch (error) {
      console.error('Update budget error:', error);
      return { data: null, error };
    }
  },

  // Delete budget (soft delete by setting is_active to false)
  deleteBudget: async (budgetId) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ is_active: false })
        .eq('id', budgetId);
      return { data, error };
    } catch (error) {
      console.error('Delete budget error:', error);
      return { data: null, error };
    }
  },
}; 