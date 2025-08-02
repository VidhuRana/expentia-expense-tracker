import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, db, supabase } from '../services/supabaseClient';
import Logo from '../components/Logo';
import BottomNavigation from '../components/BottomNavigation';
import LoadingSkeleton from '../components/LoadingSkeleton';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Add Expense Modal State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Categories for expense
  const categories = [
    { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#ef4444' },
    { id: 'transport', name: 'Transportation', icon: 'car', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#f59e0b' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical', color: '#10b981' },
    { id: 'bills', name: 'Bills', icon: 'card', color: '#06b6d4' },
    { id: 'education', name: 'Education', icon: 'school', color: '#84cc16' },
    { id: 'other', name: 'Other', icon: 'help-circle', color: '#6b7280' },
  ];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Start animation immediately for better perceived performance
        animateIn();
        
        // Check if user is authenticated first
        const { data: { user }, error: userError } = await auth.getCurrentUser();
        if (userError || !user) {
          console.log('User not authenticated, skipping budget data fetch');
          setLoading(false);
          return;
        }
        
        // Fetch data in parallel for better performance
        await Promise.all([
          fetchUserProfile(),
          fetchExpensesData(user.id)
        ]);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle focus to reset active tab
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveTab('home');
    });

    return unsubscribe;
  }, [navigation]);

  // Handle route parameters
  useEffect(() => {
    if (route.params?.showAddExpense) {
      setShowAddExpense(true);
      // Clear the parameter
      navigation.setParams({ showAddExpense: undefined });
    }
  }, [route.params?.showAddExpense]);

  // Handle tab press from bottom navigation
  const handleTabPress = (tabName) => {
    if (tabName === 'addExpense') {
      setShowAddExpense(true);
      return;
    }
    setActiveTab(tabName);
  };

  // Budget state
  const [budgetUsage, setBudgetUsage] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Recalculate budget left when monthly budget changes
  useEffect(() => {
    console.log('Budget changed - Monthly Budget:', monthlyBudget, 'Total Spent:', totalSpent);
    if (monthlyBudget !== null) {
      setBudgetLeft(monthlyBudget - totalSpent);
    } else {
      setBudgetLeft(null);
    }
  }, [monthlyBudget, totalSpent]);

  // Memoized budget calculation
  const budgetDisplay = useMemo(() => {
    if (budgetUsage.length > 0) {
      const totalRemaining = budgetUsage.reduce((total, budget) => total + (budget.remaining_amount || 0), 0);
      return `₹${totalRemaining.toFixed(2)}`;
    } else if (budgetLeft !== null) {
      return `₹${(budgetLeft || 0).toFixed(2)}`;
    } else {
      return 'Set Budget';
    }
  }, [budgetUsage, budgetLeft]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        setAuthError(userError);
        // If user is not authenticated, redirect to login
        if (userError?.message?.includes('Auth session missing')) {
          console.log('User not authenticated, redirecting to login');
          navigation.replace('Login');
          return;
        }
        return;
      }
      
      // Fetch profile and budget data in parallel
      const [profileResult, budgetUsageResult, budgetAlertsResult] = await Promise.all([
        db.getUserProfile(user.id),
        db.getBudgetUsage(user.id),
        db.getBudgetAlerts(user.id)
      ]);

      // Handle profile data
      const { data: profile, error: profileError } = profileResult;
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        }
      } else if (profile) {
        setUserName(profile.full_name || 'User');
        // Load budget from profile
        if (profile.monthly_budget) {
          setMonthlyBudget(profile.monthly_budget);
        } else {
          setMonthlyBudget(null);
        }
      }

      // Handle budget usage data
      const { data: usageData, error: usageError } = budgetUsageResult;
      if (usageError) {
        console.error('Error fetching budget usage:', usageError);
      } else {
        setBudgetUsage(usageData || []);
      }

      // Handle budget alerts data
      const { data: alertsData, error: alertsError } = budgetAlertsResult;
      if (alertsError) {
        console.error('Error fetching budget alerts:', alertsError);
      } else {
        setBudgetAlerts(alertsData || []);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const fetchExpensesData = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return;
      }

      const expensesData = data || [];
      setExpenses(expensesData);

      // Calculate total spent with null check
      const total = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setTotalSpent(total);

      // Find top category
      const categoryCounts = {};
      expensesData.forEach(expense => {
        if (expense.category) {
          categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
        }
      });
      
      const topCat = Object.keys(categoryCounts).length > 0 
        ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
        : 'No expenses yet';
      setTopCategory(topCat);

      // Generate weekly data
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyStats = weekDays.map(day => {
        const dayExpenses = expensesData.filter(expense => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate.getDay() === weekDays.indexOf(day);
        });
        const dayTotal = dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        return { day, amount: dayTotal, percentage: dayTotal > 0 ? (dayTotal / total * 100) : 0 };
      });
      setWeeklyData(weeklyStats);

      // Calculate percentage change (mock for now)
      setPercentageChange(expensesData.length > 0 ? 15.5 : 0);

      // Set recent transactions with null checks
      const recent = expensesData.slice(0, 5).map(expense => ({
        id: expense.id,
        name: expense.description || expense.category || 'Unknown',
        category: expense.category || 'Other',
        icon: getCategoryIcon(expense.category || 'Other'),
        amount: expense.amount || 0,
        time: formatTimeAgo(expense.created_at),
        type: 'expense'
      }));
      setRecentTransactions(recent);

    } catch (error) {
      console.error('Error in fetchExpensesData:', error);
    }
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleSaveExpense = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please enter amount and select a category');
      return;
    }

    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      // Get the selected category name
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
      const categoryName = selectedCategoryData ? selectedCategoryData.name : 'Other';

      // Save expense to Supabase
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            category: categoryName,
            amount: parseFloat(amount),
            description: notes || null,
            date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error saving expense:', error);
        Alert.alert('Error', 'Failed to save expense. Please try again.');
        return;
      }

      // Show custom success message with animation
      setShowSuccessMessage(true);
      // Trigger entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setShowAddExpense(false);
      resetForm();
      
      // Refresh data after adding expense
      const { data: { user: currentUser } } = await auth.getCurrentUser();
      if (currentUser) {
        await fetchExpensesData(currentUser.id);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    }
  };

  const resetForm = () => {
    setAmount('');
    setSelectedCategory('');
    setNotes('');
    setSelectedDate(new Date());
  };



  const handleCancel = () => {
    setShowAddExpense(false);
    resetForm();
  };

  const handleAIAssistant = () => {
    Alert.alert('AI Assistant', 'AI assistant functionality coming soon!');
  };

  // Live data state
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budgetLeft, setBudgetLeft] = useState(2000); // Default budget
  const [monthlyBudget, setMonthlyBudget] = useState(null); // Monthly budget - will be loaded from database
  const [topCategory, setTopCategory] = useState('No expenses yet');
  const [weeklyData, setWeeklyData] = useState([]);
  const [percentageChange, setPercentageChange] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const getCategoryIcon = useCallback((category) => {
    const iconMap = {
      'Food & Dining': 'restaurant',
      'Transportation': 'car',
      'Shopping': 'bag',
      'Entertainment': 'game-controller',
      'Healthcare': 'medical',
      'Income': 'card',
    };
    return iconMap[category] || 'help-circle';
  }, []);

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle = {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  };

  const greetingStyle = {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  };

  const summaryCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const summaryRowStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const summaryLabelStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  };

  const summaryValueStyle = {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  };

  const chartCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const chartHeaderStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  };

  const chartTitleStyle = {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  };

  const percentageStyle = {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  };

  const barContainerStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: theme.spacing.md,
  };

  const barStyle = (percentage) => ({
    width: (width - 80) / 7,
    height: percentage * 1.2,
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
    marginHorizontal: 2,
  });

  const barLabelStyle = {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  };

  const transactionsCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: 140, // Space for floating bottom nav
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const transactionItemStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const transactionIconStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  };

  const transactionDetailsStyle = {
    flex: 1,
  };

  const transactionNameStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  };

  const transactionTimeStyle = {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  };

  const transactionAmountStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  };



  const aiButtonStyle = {
    position: 'absolute',
    bottom: 120,
    right: 25,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: theme.colors.background,
  };

  // Modal Styles
  const modalOverlayStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  };

  const modalContentStyle = {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '85%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  };

  const modalHeaderStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const modalTitleStyle = {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  };

  const closeButtonStyle = {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  };

  const inputContainerStyle = {
    marginBottom: theme.spacing.lg,
  };

  const inputLabelStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  };

  const amountInputStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  };

  const notesInputStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 60,
    textAlignVertical: 'top',
  };

  const categoryContainerStyle = {
    marginBottom: theme.spacing.lg,
  };

  const categoryGridStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  };

  const categoryItemStyle = (isSelected) => ({
    width: (width - 80) / 2,
    backgroundColor: isSelected ? theme.colors.accent : theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
  });

  const categoryIconStyle = (color) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  });

  const categoryNameStyle = (isSelected) => ({
    color: isSelected ? theme.colors.primary : theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  });

  const dateContainerStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  };

  const dateTextStyle = {
    color: theme.colors.text,
    fontSize: 16,
  };

  const saveButtonStyle = {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const saveButtonTextStyle = {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  };

  // Success Message Styles
  const successMessageStyle = {
    position: 'absolute',
    top: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: '#10b981',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  };

  const successIconStyle = {
    marginRight: theme.spacing.md,
  };

  const successTextStyle = {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  };

  const buttonTextStyle = (isPrimary) => ({
    color: isPrimary ? theme.colors.primary : theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  });

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Success Message */}
      {showSuccessMessage && (
        <Animated.View 
          style={[
            successMessageStyle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={24} color="#ffffff" style={successIconStyle} />
          <Text style={successTextStyle}>Expense added successfully! 🎉</Text>
        </Animated.View>
      )}
      
      <Animated.View
        style={[
          contentStyle,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Error Display */}
          {authError && (
            <View style={{ 
              backgroundColor: '#ef4444', 
              padding: theme.spacing.md, 
              marginBottom: theme.spacing.md,
              borderRadius: theme.borderRadius.md 
            }}>
              <Text style={{ color: '#ffffff', textAlign: 'center' }}>
                Authentication error. Please log in again.
              </Text>
            </View>
          )}
          
          {/* Header with Budget Button */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <Text style={greetingStyle}>Hi, {userName} 👋</Text>
            <TouchableOpacity 
              style={{
                backgroundColor: theme.colors.accent,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.lg,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('Budget')}
            >
              <Ionicons name="wallet" size={18} color={theme.colors.primary} />
              <Text style={{
                color: theme.colors.primary,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: theme.spacing.xs,
              }}>
                Budget
              </Text>
            </TouchableOpacity>
          </View>

          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <View style={{
              backgroundColor: '#fef3c7',
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b',
            }}>
              <Text style={{
                color: '#92400e',
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: theme.spacing.sm,
              }}>
                Budget Alerts
              </Text>
              {budgetAlerts.map((alert, index) => (
                <View key={index} style={{
                  backgroundColor: alert.alert_level === 'exceeded' ? '#fecaca' : '#fef3c7',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.xs,
                  borderLeftWidth: 3,
                  borderLeftColor: alert.alert_level === 'exceeded' ? '#ef4444' : '#f59e0b',
                }}>
                  <Text style={{
                    color: alert.alert_level === 'exceeded' ? '#991b1b' : '#92400e',
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {alert.budget_name} - {alert.alert_level === 'exceeded' ? 'Budget Exceeded!' : `${alert.usage_percentage.toFixed(1)}% Used`}
                  </Text>
                  <Text style={{
                    color: alert.alert_level === 'exceeded' ? '#991b1b' : '#92400e',
                    fontSize: 12,
                    marginTop: 2,
                  }}>
                    ₹{alert.used_amount.toFixed(2)} / ₹{alert.budget_amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary Card */}
          <View style={summaryCardStyle}>
            {loading ? (
              <>
                <View style={summaryRowStyle}>
                  <Text style={summaryLabelStyle}>Total Spent</Text>
                  <LoadingSkeleton width={80} height={24} />
                </View>
                <View style={summaryRowStyle}>
                  <Text style={summaryLabelStyle}>Budget Left</Text>
                  <LoadingSkeleton width={100} height={24} />
                </View>
                <View style={summaryRowStyle}>
                  <Text style={summaryLabelStyle}>Top Category</Text>
                  <LoadingSkeleton width={120} height={24} />
                </View>
              </>
            ) : (
              <>
                <View style={summaryRowStyle}>
                  <Text style={summaryLabelStyle}>Total Spent</Text>
                  <Text style={summaryValueStyle}>₹{(totalSpent || 0).toFixed(2)}</Text>
                </View>
                <View style={summaryRowStyle}>
                  <Text style={summaryLabelStyle}>Budget Left</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[summaryValueStyle, { color: '#10b981' }]}>
                      {budgetDisplay}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('Budget')}
                      style={{ marginLeft: theme.spacing.sm }}
                    >
                      <Ionicons name="settings" size={16} color={theme.colors.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={summaryRowStyle}>
                  <Text style={summaryLabelStyle}>Top Category</Text>
                  <Text style={summaryValueStyle}>{topCategory}</Text>
                </View>
              </>
            )}
          </View>

          {/* Weekly Chart */}
          <View style={chartCardStyle}>
            <View style={chartHeaderStyle}>
              <Text style={chartTitleStyle}>This Week</Text>
              {loading ? (
                <LoadingSkeleton width={60} height={16} />
              ) : (
                <Text style={percentageStyle}>+{percentageChange}%</Text>
              )}
            </View>
            
            <View style={barContainerStyle}>
              {loading ? (
                // Loading skeleton for bars
                Array.from({ length: 7 }).map((_, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <LoadingSkeleton width={(width - 80) / 7} height={60} />
                    <Text style={barLabelStyle}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</Text>
                  </View>
                ))
              ) : (
                weeklyData.map((item, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <View style={barStyle(item.percentage)} />
                    <Text style={barLabelStyle}>{item.day}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={transactionsCardStyle}>
            <Text style={chartTitleStyle}>Recent Transactions</Text>
            
            {loading ? (
              // Loading skeleton for transactions
              Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={transactionItemStyle}>
                  <LoadingSkeleton width={40} height={40} style={{ borderRadius: 20 }} />
                  <View style={transactionDetailsStyle}>
                    <LoadingSkeleton width={120} height={16} style={{ marginBottom: 4 }} />
                    <LoadingSkeleton width={80} height={12} />
                  </View>
                  <LoadingSkeleton width={60} height={18} />
                </View>
              ))
            ) : (
              recentTransactions.map((transaction) => (
                <TouchableOpacity 
                  key={transaction.id} 
                  style={transactionItemStyle}
                  activeOpacity={0.7}
                >
                  <View style={transactionIconStyle}>
                    <Ionicons 
                      name={getCategoryIcon(transaction.category)} 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  
                  <View style={transactionDetailsStyle}>
                    <Text style={transactionNameStyle}>{transaction.name}</Text>
                    <Text style={transactionTimeStyle}>{transaction.time}</Text>
                  </View>
                  
                  <Text style={[
                    transactionAmountStyle,
                    { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount || 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>

             {/* Bottom Navigation */}
       <BottomNavigation 
         navigation={navigation}
         activeTab={activeTab}
         onTabPress={handleTabPress}
       />

       {/* AI Assistant Button */}
               <TouchableOpacity 
          style={aiButtonStyle} 
          onPress={handleAIAssistant}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Add Expense Modal */}
        <Modal
          visible={showAddExpense}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancel}
        >
          <View style={modalOverlayStyle}>
            <View style={modalContentStyle}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={modalHeaderStyle}>
                  <Text style={modalTitleStyle}>Add Expense</Text>
                  <TouchableOpacity onPress={handleCancel} style={closeButtonStyle}>
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={inputContainerStyle}>
                  <Text style={inputLabelStyle}>Amount</Text>
                                     <TextInput
                     style={amountInputStyle}
                     value={amount}
                     onChangeText={setAmount}
                     placeholder="₹0.00"
                     placeholderTextColor={theme.colors.textSecondary}
                     keyboardType="numeric"
                     autoFocus={true}
                   />
                </View>

                                 {/* Category Selection */}
                 <View style={categoryContainerStyle}>
                   <Text style={inputLabelStyle}>Category</Text>
                   <View style={categoryGridStyle}>
                     {categories.map((category) => (
                       <TouchableOpacity
                         key={category.id}
                         style={categoryItemStyle(selectedCategory === category.id)}
                         onPress={() => setSelectedCategory(category.id)}
                         activeOpacity={0.7}
                       >
                         <View style={categoryIconStyle(category.color)}>
                           <Ionicons name={category.icon} size={20} color="#ffffff" />
                         </View>
                         <Text style={categoryNameStyle(selectedCategory === category.id)}>
                           {category.name}
                         </Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 </View>

                {/* Date Selection */}
                <View style={inputContainerStyle}>
                  <Text style={inputLabelStyle}>Date</Text>
                  <TouchableOpacity style={dateContainerStyle}>
                    <Text style={dateTextStyle}>
                      {selectedDate.toLocaleDateString()} at {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Notes Input */}
                <View style={inputContainerStyle}>
                  <Text style={inputLabelStyle}>Notes (Optional)</Text>
                  <TextInput
                    style={notesInputStyle}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add a note about this expense..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>

                                 {/* Save Button */}
                 <TouchableOpacity 
                   style={saveButtonStyle} 
                   onPress={handleSaveExpense}
                   activeOpacity={0.7}
                 >
                   <Text style={saveButtonTextStyle}>Save Expense</Text>
                 </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>


      </SafeAreaView>
    );
  };

export default HomeScreen; 