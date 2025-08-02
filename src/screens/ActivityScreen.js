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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, supabase } from '../services/supabaseClient';
import BottomNavigation from '../components/BottomNavigation';

const ActivityScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food & Dining': 'restaurant',
      'Transportation': 'car',
      'Shopping': 'bag',
      'Entertainment': 'game-controller',
      'Healthcare': 'medical',
      'Bills': 'card',
      'Education': 'school',
      'Other': 'help-circle',
    };
    return iconMap[category] || 'help-circle';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupExpensesByDate = (expenses) => {
    const groups = {};
    expenses.forEach(expense => {
      const dateKey = formatDate(expense.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });
    return groups;
  };

  const groupedExpenses = groupExpensesByDate(expenses);

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

  const dateGroupStyle = {
    marginBottom: theme.spacing.xl,
  };

  const dateHeaderStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  };

  const expenseItemStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  };

  const expenseIconStyle = (color) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  });

  const expenseDetailsStyle = {
    flex: 1,
  };

  const expenseTitleStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  };

  const expenseTimeStyle = {
    color: theme.colors.textSecondary,
    fontSize: 12,
  };

  const expenseAmountStyle = {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
  };

  const loadingContainerStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const loadingTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 16,
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
        <Text style={headerTitleStyle}>Activity</Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.accent}
              colors={[theme.colors.accent]}
            />
          }
          contentContainerStyle={{ paddingBottom: 140 }} // Space for navbar
        >
                 {loading ? (
           <View style={loadingContainerStyle}>
             <Text style={loadingTextStyle}>Loading expenses...</Text>
           </View>
         ) : expenses.length === 0 ? (
           <View style={emptyStateStyle}>
             <View style={emptyIconStyle}>
               <Ionicons name="receipt-outline" size={40} color={theme.colors.textSecondary} />
             </View>
             <Text style={emptyTitleStyle}>No expenses yet</Text>
             <Text style={emptySubtitleStyle}>
               Start tracking your expenses by tapping the + button to add your first expense
             </Text>
           </View>
         ) : (
           <>
             {Object.entries(groupedExpenses).map(([dateGroup, dateExpenses]) => (
               <View key={dateGroup} style={dateGroupStyle}>
                 <Text style={dateHeaderStyle}>{dateGroup}</Text>
                 
                 {dateExpenses.map((expense) => (
                   <TouchableOpacity 
                     key={expense.id} 
                     style={expenseItemStyle}
                     activeOpacity={0.7}
                   >
                     <View style={expenseIconStyle(getCategoryColor(expense.category))}>
                       <Ionicons 
                         name={getCategoryIcon(expense.category)} 
                         size={24} 
                         color="#ffffff" 
                       />
                     </View>
                     
                     <View style={expenseDetailsStyle}>
                       <Text style={expenseTitleStyle}>
                         {expense.description || expense.category}
                       </Text>
                       <Text style={expenseTimeStyle}>
                         {formatTime(expense.created_at)}
                       </Text>
                     </View>
                     
                                           <Text style={expenseAmountStyle}>
                        -₹{(expense.amount || 0).toFixed(2)}
                      </Text>
                   </TouchableOpacity>
                 ))}
               </View>
             ))}
           </>
         )}
                 </ScrollView>
        </Animated.View>

                 {/* Bottom Navigation */}
         <BottomNavigation 
           navigation={navigation}
           activeTab="activity"
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

export default ActivityScreen; 