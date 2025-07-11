
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ListTodo, FileText, BarChart3, UserCircle2 } from 'lucide-react';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import NotesScreen from '../screens/NotesScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home color={color} />
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color }) => <ListTodo color={color} />
        }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{
          tabBarIcon: ({ color }) => <FileText color={color} />
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color }) => <BarChart3 color={color} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <UserCircle2 color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
