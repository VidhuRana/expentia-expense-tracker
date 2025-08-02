# Budget System Setup Guide

## Overview
This guide will help you set up the new comprehensive budget system for the Expentia app. The new system supports both overall budgets and category-specific budgets with real-time tracking and alerts.

## Database Setup

### 1. Run the Budget System SQL
Execute the `budget-system.sql` file in your Supabase SQL editor:

```sql
-- This creates the budgets table and necessary functions
-- Run this in your Supabase SQL editor
```

### 2. Verify Database Structure
After running the SQL, you should have:
- `budgets` table with proper RLS policies
- `get_budget_usage()` function for calculating budget usage
- `check_budget_alerts()` function for budget alerts
- Proper indexes for performance

## Features Implemented

### ✅ Budget Management
- Create overall budgets (e.g., ₹20,000/month)
- Create category-specific budgets (e.g., ₹5,000 for Food)
- Edit and delete budgets
- Visual progress bars and alerts

### ✅ Real-time Tracking
- Automatic calculation of budget usage
- Live updates when expenses are added
- Progress tracking with visual indicators

### ✅ Smart Alerts
- 75% budget usage warning (yellow)
- 90% budget usage warning (orange)
- 100% budget exceeded alert (red)
- Alerts shown on both Home and Budget screens

### ✅ User Experience
- Dedicated Budget screen with full CRUD operations
- Budget alerts prominently displayed on Home screen
- Easy navigation via bottom tab
- Intuitive category selection

## User Flow

### Setting Up Budgets
1. Navigate to the Budget tab
2. Tap "Add Budget"
3. Enter budget name and amount
4. Select category (optional for overall budget)
5. Save budget

### Tracking Expenses
1. Add expenses as usual via the + button
2. System automatically checks against active budgets
3. Budget usage updates in real-time
4. Alerts appear when thresholds are reached

### Viewing Budget Status
- **Home Screen**: Shows budget alerts and quick access to budget settings
- **Budget Screen**: Full budget management with progress bars
- **Reports Screen**: Budget analytics (can be enhanced further)

## Technical Implementation

### Database Functions
- `get_budget_usage(user_id)`: Returns budget usage with calculations
- `check_budget_alerts(user_id)`: Returns budgets that need alerts

### API Functions (supabaseClient.js)
- `db.createBudget()`: Create new budget
- `db.getUserBudgets()`: Get user's budgets
- `db.getBudgetUsage()`: Get budget usage data
- `db.getBudgetAlerts()`: Get budget alerts
- `db.updateBudget()`: Update budget
- `db.deleteBudget()`: Soft delete budget

### React Components
- `BudgetScreen`: Full budget management interface
- Updated `HomeScreen`: Budget alerts and navigation
- Updated `AppNavigator`: Added Budget route

## Testing the System

### 1. Create Test Budgets
- Create an overall budget of ₹10,000
- Create a Food budget of ₹3,000
- Create a Transport budget of ₹2,000

### 2. Add Test Expenses
- Add ₹1,500 Food expense → Should show 50% usage
- Add ₹1,000 Transport expense → Should show 50% usage
- Add ₹2,000 Food expense → Should trigger 75% alert
- Add ₹1,000 Food expense → Should trigger 90% alert
- Add ₹500 Food expense → Should trigger exceeded alert

### 3. Verify Alerts
- Check Home screen for budget alerts
- Check Budget screen for progress bars
- Verify alert colors and messages

## Customization Options

### Alert Thresholds
You can modify the alert thresholds in the `check_budget_alerts()` function:
```sql
CASE 
  WHEN usage.usage_percentage >= 100 THEN 'exceeded'
  WHEN usage.usage_percentage >= 90 THEN 'warning_90'
  WHEN usage.usage_percentage >= 75 THEN 'warning_75'
  ELSE 'normal'
END as alert_level
```

### Alert Colors
Modify the `getAlertColor()` function in BudgetScreen.js:
```javascript
const getAlertColor = (alertLevel) => {
  switch (alertLevel) {
    case 'exceeded': return '#ef4444'; // Red
    case 'warning_90': return '#f59e0b'; // Orange
    case 'warning_75': return '#fbbf24'; // Yellow
    default: return '#10b981'; // Green
  }
};
```

## Troubleshooting

### Common Issues

1. **Budgets not showing**: Check if RLS policies are properly set
2. **Alerts not working**: Verify the database functions are created
3. **Real-time updates**: Ensure budget data is refreshed after expense addition

### Debug Steps
1. Check Supabase logs for SQL errors
2. Verify database functions exist
3. Test budget creation manually in Supabase
4. Check React Native console for API errors

## Next Steps

### Potential Enhancements
1. **Budget Analytics**: Add charts and trends
2. **Budget Templates**: Pre-defined budget categories
3. **Budget Sharing**: Family/shared budgets
4. **Budget Notifications**: Push notifications for alerts
5. **Budget Export**: Export budget reports
6. **Budget History**: Track budget changes over time

### Performance Optimizations
1. Add caching for budget calculations
2. Implement pagination for large budget lists
3. Optimize database queries with better indexing
4. Add offline support for budget management

## Support

If you encounter any issues:
1. Check the Supabase logs
2. Verify all SQL functions are created
3. Test the API functions manually
4. Review the React Native console for errors

The budget system is now fully integrated and ready for use! 🎉 