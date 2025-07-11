
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { PomodoroProvider } from './src/contexts/PomodoroContext';
import { TaskProvider } from './src/contexts/TaskContext';
import { UserDataProvider } from './src/contexts/UserDataContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <PomodoroProvider>
          <TaskProvider>
            <UserDataProvider>
              <RootNavigator />
            </UserDataProvider>
          </TaskProvider>
        </PomodoroProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
