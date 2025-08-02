import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, supabase } from '../services/supabaseClient';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start animation immediately for better perceived performance
    animateIn();
    fetchExpenses();
  }, []);

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const fetchExpenses = async () => {
    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error('Error in fetchExpenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Food & Dining': '#ef4444',
      'Transportation': '#3b82f6',
      'Shopping': '#8b5cf6',
      'Entertainment': '#f59e0b',
      'Healthcare': '#10b981',
      'Bills': '#06b6d4',
      'Education': '#84cc16',
      'Other': '#6b7280',
    };
    return colorMap[category] || '#6b7280';
  };

  const calculateCategoryStats = () => {
    const categoryTotals = {};
    const categoryCounts = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      const amount = expense.amount || 0;
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
        categoryCounts[category] = 0;
      }
      categoryTotals[category] += amount;
      categoryCounts[category] += 1;
    });

    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.keys(categoryTotals).map(category => ({
      category,
      amount: categoryTotals[category],
      count: categoryCounts[category],
      percentage: totalSpent > 0 ? (categoryTotals[category] / totalSpent * 100) : 0,
      color: getCategoryColor(category)
    })).sort((a, b) => b.amount - a.amount);
  };

  const categoryStats = calculateCategoryStats();
  const totalSpent = categoryStats.reduce((sum, stat) => sum + stat.amount, 0);

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const headerTitleStyle = {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: theme.spacing.md,
  };

  const backButtonStyle = {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  };

  const contentStyle = {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
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

  const summaryTitleStyle = {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  };

  const totalAmountStyle = {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  };

  const categoryCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  };

  const categoryItemStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const categoryIconStyle = (color) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  });

  const categoryDetailsStyle = {
    flex: 1,
  };

  const categoryNameStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  };

  const categoryAmountStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
  };

  const categoryPercentageStyle = {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  };

  const progressBarStyle = {
    height: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 2,
    marginTop: theme.spacing.sm,
  };

  const progressFillStyle = (percentage, color) => ({
    height: 4,
    backgroundColor: color,
    borderRadius: 2,
    width: `${percentage}%`,
  });

  const emptyStateStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  };

  const emptyIconStyle = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  };

  const emptyTitleStyle = {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  };

  const emptySubtitleStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={backButtonStyle}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Reports</Text>
      </View>

      <Animated.View 
        style={[
          contentStyle,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {loading ? (
            <View style={emptyStateStyle}>
              <Text style={emptyTitleStyle}>Loading reports...</Text>
            </View>
          ) : expenses.length === 0 ? (
            <View style={emptyStateStyle}>
              <View style={emptyIconStyle}>
                <Ionicons name="bar-chart-outline" size={40} color={theme.colors.textSecondary} />
              </View>
              <Text style={emptyTitleStyle}>No reports yet</Text>
              <Text style={emptySubtitleStyle}>
                Add some expenses to see your spending reports and analytics
              </Text>
            </View>
          ) : (
            <>
              {/* Summary Card */}
              <View style={summaryCardStyle}>
                <Text style={summaryTitleStyle}>Total Spent</Text>
                                 <Text style={totalAmountStyle}>₹{(totalSpent || 0).toFixed(2)}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                  {expenses.length} transactions
                </Text>
              </View>

              {/* Category Breakdown */}
              <View style={categoryCardStyle}>
                <Text style={summaryTitleStyle}>Spending by Category</Text>
                
                {categoryStats.map((stat, index) => (
                  <View key={stat.category} style={categoryItemStyle}>
                    <View style={categoryIconStyle(stat.color)}>
                      <Ionicons name="circle" size={16} color="#ffffff" />
                    </View>
                    
                    <View style={categoryDetailsStyle}>
                      <Text style={categoryNameStyle}>{stat.category}</Text>
                                             <Text style={categoryAmountStyle}>
                         ₹{(stat.amount || 0).toFixed(2)} • {stat.count} transactions
                       </Text>
                      <View style={progressBarStyle}>
                        <View style={progressFillStyle(stat.percentage, stat.color)} />
                      </View>
                    </View>
                    
                    <Text style={categoryPercentageStyle}>
                      {stat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>

      {/* Bottom Navigation */}
      <BottomNavigation 
        navigation={navigation}
        activeTab="reports"
        onTabPress={(tabName) => {
          if (tabName === 'addExpense') {
            navigation.navigate('Home', { showAddExpense: true });
          }
        }}
      />

      {/* AI Assistant Button */}
      <TouchableOpacity 
        style={aiButtonStyle} 
        onPress={() => {}}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ReportsScreen; 