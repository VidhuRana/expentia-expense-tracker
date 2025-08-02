import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  StatusBar,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, db, supabase } from '../services/supabaseClient';

const BudgetScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [budgetUsage, setBudgetUsage] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Form state
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Categories for budget
  const categories = [
    { id: '', name: 'Overall Budget', icon: 'wallet', color: '#3b82f6' },
    { id: 'Food & Dining', name: 'Food & Dining', icon: 'restaurant', color: '#ef4444' },
    { id: 'Transportation', name: 'Transportation', icon: 'car', color: '#3b82f6' },
    { id: 'Shopping', name: 'Shopping', icon: 'bag', color: '#8b5cf6' },
    { id: 'Entertainment', name: 'Entertainment', icon: 'game-controller', color: '#f59e0b' },
    { id: 'Healthcare', name: 'Healthcare', icon: 'medical', color: '#10b981' },
    { id: 'Bills', name: 'Bills', icon: 'card', color: '#06b6d4' },
    { id: 'Education', name: 'Education', icon: 'school', color: '#84cc16' },
    { id: 'Other', name: 'Other', icon: 'help-circle', color: '#6b7280' },
  ];

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        setLoading(false);
        return;
      }

      // Only fetch data if user is authenticated
      if (user && user.id) {
        try {
          // Fetch budgets
          const { data: budgetsData, error: budgetsError } = await db.getUserBudgets(user.id);
          if (budgetsError) {
            console.error('Error fetching budgets:', budgetsError);
          } else {
            setBudgets(budgetsData || []);
          }

          // Fetch budget usage
          const { data: usageData, error: usageError } = await db.getBudgetUsage(user.id);
          if (usageError) {
            console.error('Error fetching budget usage:', usageError);
          } else {
            setBudgetUsage(usageData || []);
          }

          // Fetch budget alerts
          const { data: alertsData, error: alertsError } = await db.getBudgetAlerts(user.id);
          if (alertsError) {
            console.error('Error fetching budget alerts:', alertsError);
          } else {
            setBudgetAlerts(alertsData || []);
          }
        } catch (error) {
          console.error('Error fetching budget data:', error);
        }
      }
    } catch (error) {
      console.error('Error in fetchBudgetData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = () => {
    setBudgetName('');
    setBudgetAmount('');
    setSelectedCategory('');
    setStartDate(new Date());
    setEndDate(new Date());
    setShowAddBudget(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetName || !budgetAmount) {
      Alert.alert('Error', 'Please enter budget name and amount');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      const budgetData = {
        name: budgetName,
        amount: amount,
        category: selectedCategory || null,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      const { data, error } = await db.createBudget(user.id, budgetData);
      if (error) {
        console.error('Error creating budget:', error);
        Alert.alert('Error', 'Failed to create budget. Please try again.');
        return;
      }

      Alert.alert('Success', 'Budget created successfully!');
      setShowAddBudget(false);
      fetchBudgetData(); // Refresh data
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetName(budget.name);
    setBudgetAmount(budget.amount.toString());
    setSelectedCategory(budget.category || '');
    setStartDate(new Date(budget.start_date));
    setEndDate(new Date(budget.end_date));
    setShowEditBudget(true);
  };

  const handleUpdateBudget = async () => {
    if (!budgetName || !budgetAmount) {
      Alert.alert('Error', 'Please enter budget name and amount');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      const updates = {
        name: budgetName,
        amount: amount,
        category: selectedCategory || null,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      const { data, error } = await db.updateBudget(editingBudget.id, updates);
      if (error) {
        console.error('Error updating budget:', error);
        Alert.alert('Error', 'Failed to update budget. Please try again.');
        return;
      }

      Alert.alert('Success', 'Budget updated successfully!');
      setShowEditBudget(false);
      setEditingBudget(null);
      fetchBudgetData(); // Refresh data
    } catch (error) {
      console.error('Error updating budget:', error);
      Alert.alert('Error', 'Failed to update budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await db.deleteBudget(budget.id);
              if (error) {
                console.error('Error deleting budget:', error);
                Alert.alert('Error', 'Failed to delete budget. Please try again.');
                return;
              }

              Alert.alert('Success', 'Budget deleted successfully!');
              fetchBudgetData(); // Refresh data
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getAlertColor = (alertLevel) => {
    switch (alertLevel) {
      case 'exceeded':
        return '#ef4444';
      case 'warning_90':
        return '#f59e0b';
      case 'warning_75':
        return '#fbbf24';
      default:
        return '#10b981';
    }
  };

  const getAlertMessage = (alertLevel) => {
    switch (alertLevel) {
      case 'exceeded':
        return 'Budget Exceeded!';
      case 'warning_90':
        return '90% Used';
      case 'warning_75':
        return '75% Used';
      default:
        return 'Normal';
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle = {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  };

  const headerStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  };

  const titleStyle = {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  };

  const addButtonStyle = {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const addButtonTextStyle = {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  };

  const budgetCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const budgetHeaderStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const budgetNameStyle = {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  };

  const budgetAmountStyle = {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  };

  const progressContainerStyle = {
    marginTop: theme.spacing.md,
  };

  const progressBarStyle = {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  };

  const progressFillStyle = (percentage, alertLevel) => ({
    height: '100%',
    backgroundColor: getAlertColor(alertLevel),
    width: `${Math.min(percentage, 100)}%`,
  });

  const progressTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.sm,
  };

  const alertStyle = (alertLevel) => ({
    backgroundColor: getAlertColor(alertLevel),
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  });

  const alertTextStyle = {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  };

  const actionButtonsStyle = {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  };

  const actionButtonStyle = {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  };

  const actionButtonTextStyle = {
    fontSize: 12,
    fontWeight: '600',
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

  const inputStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    width: '48%',
    backgroundColor: isSelected ? theme.colors.accent : theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
  });

  const categoryIconStyle = (color) => ({
    width: 32,
    height: 32,
    borderRadius: 16,
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

  const saveButtonStyle = {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  };

  const saveButtonTextStyle = {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  };

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={contentStyle}>
        {/* Header */}
        <View style={headerStyle}>
          <Text style={titleStyle}>Budgets</Text>
          <TouchableOpacity style={addButtonStyle} onPress={handleAddBudget}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={addButtonTextStyle}>Add Budget</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: 18, 
                fontWeight: 'bold',
                marginBottom: theme.spacing.md 
              }}>
                Budget Alerts
              </Text>
              {budgetAlerts.map((alert, index) => (
                <View key={index} style={alertStyle(alert.alert_level)}>
                  <Text style={alertTextStyle}>
                    {alert.budget_name} - {getAlertMessage(alert.alert_level)}
                  </Text>
                  <Text style={[alertTextStyle, { fontSize: 10, marginTop: 2 }]}>
                    ₹{alert.used_amount.toFixed(2)} / ₹{alert.budget_amount.toFixed(2)} ({alert.usage_percentage.toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Budgets List */}
          {budgetUsage.length > 0 ? (
            budgetUsage.map((budget, index) => {
              const alertLevel = budgetAlerts.find(alert => alert.budget_id === budget.budget_id)?.alert_level || 'normal';
              return (
                <TouchableOpacity
                  key={budget.budget_id}
                  style={budgetCardStyle}
                  onPress={() => {
                    const budgetData = budgets.find(b => b.id === budget.budget_id);
                    if (budgetData) {
                      handleEditBudget(budgetData);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={budgetHeaderStyle}>
                    <View style={{ flex: 1 }}>
                      <Text style={budgetNameStyle}>{budget.budget_name}</Text>
                      <Text style={{ 
                        color: theme.colors.textSecondary, 
                        fontSize: 14,
                        marginTop: 2 
                      }}>
                        {budget.budget_category || 'Overall Budget'}
                      </Text>
                    </View>
                    <Text style={budgetAmountStyle}>₹{budget.budget_amount.toFixed(2)}</Text>
                  </View>

                  <View style={progressContainerStyle}>
                    <View style={progressBarStyle}>
                      <View style={progressFillStyle(budget.usage_percentage, alertLevel)} />
                    </View>
                    <Text style={progressTextStyle}>
                      ₹{budget.used_amount.toFixed(2)} used of ₹{budget.budget_amount.toFixed(2)} ({budget.usage_percentage.toFixed(1)}%)
                    </Text>
                    {alertLevel !== 'normal' && (
                      <View style={alertStyle(alertLevel)}>
                        <Text style={alertTextStyle}>
                          {getAlertMessage(alertLevel)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={actionButtonsStyle}>
                    <TouchableOpacity
                      style={[actionButtonStyle, { backgroundColor: theme.colors.accent }]}
                      onPress={() => {
                        const budgetData = budgets.find(b => b.id === budget.budget_id);
                        if (budgetData) {
                          handleEditBudget(budgetData);
                        }
                      }}
                    >
                      <Text style={[actionButtonTextStyle, { color: theme.colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[actionButtonStyle, { backgroundColor: '#ef4444' }]}
                      onPress={() => {
                        const budgetData = budgets.find(b => b.id === budget.budget_id);
                        if (budgetData) {
                          handleDeleteBudget(budgetData);
                        }
                      }}
                    >
                      <Text style={[actionButtonTextStyle, { color: '#ffffff' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{
              alignItems: 'center',
              paddingVertical: theme.spacing.xl * 2,
            }}>
              <Ionicons name="wallet-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={{
                color: theme.colors.textSecondary,
                fontSize: 18,
                fontWeight: '600',
                marginTop: theme.spacing.lg,
                textAlign: 'center',
              }}>
                No budgets yet
              </Text>
              <Text style={{
                color: theme.colors.textSecondary,
                fontSize: 14,
                marginTop: theme.spacing.sm,
                textAlign: 'center',
              }}>
                Create your first budget to start tracking your spending
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddBudget}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddBudget(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={modalHeaderStyle}>
                <Text style={modalTitleStyle}>Add New Budget</Text>
                <TouchableOpacity onPress={() => setShowAddBudget(false)} style={closeButtonStyle}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={inputContainerStyle}>
                <Text style={inputLabelStyle}>Budget Name</Text>
                <TextInput
                  style={inputStyle}
                  value={budgetName}
                  onChangeText={setBudgetName}
                  placeholder="e.g., Monthly Budget"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={inputContainerStyle}>
                <Text style={inputLabelStyle}>Amount</Text>
                <TextInput
                  style={inputStyle}
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  placeholder="₹0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={categoryContainerStyle}>
                <Text style={inputLabelStyle}>Category (Optional)</Text>
                <View style={categoryGridStyle}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={categoryItemStyle(selectedCategory === category.id)}
                      onPress={() => setSelectedCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      <View style={categoryIconStyle(category.color)}>
                        <Ionicons name={category.icon} size={16} color="#ffffff" />
                      </View>
                      <Text style={categoryNameStyle(selectedCategory === category.id)}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={saveButtonStyle} 
                onPress={handleSaveBudget}
                activeOpacity={0.7}
              >
                <Text style={saveButtonTextStyle}>Create Budget</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={showEditBudget}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditBudget(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={modalHeaderStyle}>
                <Text style={modalTitleStyle}>Edit Budget</Text>
                <TouchableOpacity onPress={() => setShowEditBudget(false)} style={closeButtonStyle}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={inputContainerStyle}>
                <Text style={inputLabelStyle}>Budget Name</Text>
                <TextInput
                  style={inputStyle}
                  value={budgetName}
                  onChangeText={setBudgetName}
                  placeholder="e.g., Monthly Budget"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={inputContainerStyle}>
                <Text style={inputLabelStyle}>Amount</Text>
                <TextInput
                  style={inputStyle}
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  placeholder="₹0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={categoryContainerStyle}>
                <Text style={inputLabelStyle}>Category (Optional)</Text>
                <View style={categoryGridStyle}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={categoryItemStyle(selectedCategory === category.id)}
                      onPress={() => setSelectedCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      <View style={categoryIconStyle(category.color)}>
                        <Ionicons name={category.icon} size={16} color="#ffffff" />
                      </View>
                      <Text style={categoryNameStyle(selectedCategory === category.id)}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={saveButtonStyle} 
                onPress={handleUpdateBudget}
                activeOpacity={0.7}
              >
                <Text style={saveButtonTextStyle}>Update Budget</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BudgetScreen; 