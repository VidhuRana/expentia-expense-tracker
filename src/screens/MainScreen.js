import React, { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from './HomeScreen';
import ActivityScreen from './ActivityScreen';
import MainLayout from '../components/MainLayout';

const MainScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const handleAddExpense = () => {
    // Trigger add expense in HomeScreen
    console.log('+ button pressed, activeTab:', activeTab);
    if (activeTab === 'home') {
      console.log('Setting showAddExpense to true');
      setShowAddExpense(true);
    }
  };

  const handleAIAssistant = () => {
    // AI Assistant functionality
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen navigation={navigation} isMainScreen={true} showAddExpense={showAddExpense} setShowAddExpense={setShowAddExpense} />;
      case 'activity':
        return <ActivityScreen navigation={navigation} isMainScreen={true} />;
      case 'reports':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Reports screen content will go here */}
          </View>
        );
      case 'account':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Account screen content will go here */}
          </View>
        );
      default:
        return <HomeScreen navigation={navigation} isMainScreen={true} showAddExpense={showAddExpense} setShowAddExpense={setShowAddExpense} />;
    }
  };

  return (
    <MainLayout 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      navigation={navigation}
      onAddExpense={handleAddExpense}
      onAIAssistant={handleAIAssistant}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default MainScreen; 