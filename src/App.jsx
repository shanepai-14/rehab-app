import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Sun, 
  Moon, 
  Home, 
  Calendar, 
  Users, 
  User, 
  Plus,
  TrendingUp,
  Award,
  Heart,
  Phone,
  MessageCircle,
  Book,
  Clock,
  CheckCircle,
  Bell
} from 'lucide-react';

// Theme Context for managing light/dark mode
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Progress Card Component
const ProgressCard = ({ title, progress, color, icon: Icon, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20">
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-lg ${color} mr-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick, color = 'bg-blue-500' }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg dark:shadow-gray-900/20 flex flex-col items-center justify-center space-y-2 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </span>
    </button>
  );
};

// Daily Goal Component
const DailyGoal = ({ title, completed, total, color }) => {
  const progress = (completed / total) * 100;
  const isCompleted = completed === total;
  
  return (
    <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="mr-3">
        <CheckCircle 
          className={`w-6 h-6 ${isCompleted ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
        />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
        <div className="flex items-center mt-1 space-x-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${color}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {completed}/{total}
          </span>
        </div>
      </div>
    </div>
  );
};

// Milestone Card Component
const MilestoneCard = ({ days, title, description, achieved }) => {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
      achieved 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          achieved 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}>
          {days}
        </div>
        <div className="ml-3 flex-1">
          <h4 className={`font-medium ${
            achieved ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {title}
          </h4>
          <p className={`text-xs ${
            achieved ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'
          }`}>
            {description}
          </p>
        </div>
        {achieved && (
          <Award className="w-5 h-5 text-green-500" />
        )}
      </div>
    </div>
  );
};

// Main App Component
function App () {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('empowered-healing-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save theme preference
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('empowered-healing-theme', newMode ? 'dark' : 'light');
  };

  // Sample data - in real app, this would come from API/state management
  const progressData = [
    { 
      title: 'Recovery Progress', 
      progress: 75, 
      color: 'bg-green-500', 
      icon: TrendingUp,
      subtitle: '9 months strong'
    },
    { 
      title: 'Daily Goals', 
      progress: 60, 
      color: 'bg-blue-500', 
      icon: Award,
      subtitle: '3 of 5 completed'
    },
    { 
      title: 'Wellness Score', 
      progress: 85, 
      color: 'bg-purple-500', 
      icon: Heart,
      subtitle: 'Excellent'
    },
  ];

  const dailyGoals = [
    { title: 'Morning Meditation', completed: 1, total: 1, color: 'bg-green-500' },
    { title: 'Therapy Session', completed: 0, total: 1, color: 'bg-blue-500' },
    { title: 'Exercise', completed: 1, total: 1, color: 'bg-yellow-500' },
    { title: 'Journal Entry', completed: 0, total: 1, color: 'bg-purple-500' },
    { title: 'Connect with Support', completed: 1, total: 1, color: 'bg-pink-500' },
  ];

  const milestones = [
    { days: 30, title: '30 Days Clean', description: 'First milestone achieved!', achieved: true },
    { days: 60, title: '60 Days Clean', description: 'Building momentum', achieved: true },
    { days: 90, title: '90 Days Clean', description: 'Quarter year strong', achieved: true },
    { days: 180, title: '6 Months Clean', description: 'Halfway to a year!', achieved: false },
    { days: 365, title: '1 Year Clean', description: 'Major milestone ahead', achieved: false },
  ];

  const themeContextValue = {
    darkMode,
    toggleTheme,
  };

  const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-all duration-200 ${
        isActive 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Home
        return (
          <div className="pb-20 pt-4">
            {/* Welcome Section */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Good morning, Sarah! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Day 147 of your recovery journey
                  </p>
                </div>
                <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Streak Counter */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Clean Streak</p>
                    <p className="text-3xl font-bold">147 Days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Next Milestone</p>
                    <p className="text-lg font-semibold">33 days to go</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Your Progress
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {progressData.map((item, index) => (
                  <ProgressCard key={index} {...item} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-4 gap-3">
                <QuickActionButton icon={Phone} label="Emergency" color="bg-red-500" />
                <QuickActionButton icon={MessageCircle} label="Chat Support" color="bg-blue-500" />
                <QuickActionButton icon={Book} label="Resources" color="bg-purple-500" />
                <QuickActionButton icon={Clock} label="Schedule" color="bg-orange-500" />
              </div>
            </div>

            {/* Daily Goals */}
            <div className="px-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Today's Goals
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3 of 5 completed
                  </p>
                </div>
                <div>
                  {dailyGoals.map((goal, index) => (
                    <DailyGoal key={index} {...goal} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Calendar
        return (
          <div className="pb-20 pt-4">
            <div className="px-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your appointments and milestones
              </p>
            </div>

            {/* Today's Schedule */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Today's Schedule
              </h2>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20">
                  <div className="flex items-center">
                    <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Therapy Session</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2:00 PM - 3:00 PM</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Dr. Wilson</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20">
                  <div className="flex items-center">
                    <div className="w-2 h-12 bg-green-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Group Meeting</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">6:00 PM - 7:30 PM</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Community Center</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                        Today
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Recovery Milestones
              </h2>
              <div className="space-y-3">
                {milestones.slice(0, 3).map((milestone, index) => (
                  <MilestoneCard key={index} {...milestone} />
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Community
        return (
          <div className="pb-20 pt-4">
            <div className="px-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Community
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with your support network
              </p>
            </div>

            {/* Support Groups */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Support Groups
              </h2>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Daily Recovery Circle</h3>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Share daily victories and challenges with others on similar journeys
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">+12</span>
                      </div>
                    </div>
                    <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Join
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Family Support Network</h3>
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                      Weekly
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Support for family members and loved ones affected by addiction
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">+8</span>
                      </div>
                    </div>
                    <button className="bg-purple-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Recent Activity
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20">
                <div className="p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Alex M.</span> shared a milestone: 30 days clean! 🎉
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Maria L.</span> posted in Daily Recovery Circle
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Jordan K.</span> completed their daily goals
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Profile
        return (
          <div className="pb-20 pt-4">
            <div className="px-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your recovery journey overview
              </p>
            </div>

            {/* Profile Header */}
            <div className="px-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">S</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Sarah Johnson
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Recovery since March 15, 2024
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-3 py-1 rounded-full font-medium">
                      147 Days Clean
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                      Level 3
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">147</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Clean</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">89%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Goal Rate</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Milestones</div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Achievement Badges
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg dark:shadow-gray-900/20 text-center">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-xs font-medium text-gray-900 dark:text-white">30 Days</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg dark:shadow-gray-900/20 text-center">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-xs font-medium text-gray-900 dark:text-white">60 Days</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg dark:shadow-gray-900/20 text-center">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-xs font-medium text-gray-900 dark:text-white">90 Days</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg dark:shadow-gray-900/20 text-center opacity-50">
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-xs font-medium text-gray-500">6 Months</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg dark:shadow-gray-900/20 text-center opacity-50">
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-xs font-medium text-gray-500">1 Year</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg dark:shadow-gray-900/20 text-center opacity-50">
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-xs font-medium text-gray-500">2 Years</div>
                </div>
              </div>
            </div>

            {/* Settings Menu */}
            <div className="px-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20">
                <div className="p-1">
                  <button className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 dark:text-white">Edit Profile</span>
                    </div>
                  </button>
                  <button className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 dark:text-white">Notifications</span>
                    </div>
                  </button>
                  <button 
                    onClick={toggleTheme}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {darkMode ? (
                          <Sun className="w-5 h-5 text-gray-400 mr-3" />
                        ) : (
                          <Moon className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

    }}

    return (
  <ThemeContext.Provider value={themeContextValue}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Tab content */}
      {renderTabContent()}

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 flex z-10">
        <TabButton icon={Home} label="Home" isActive={activeTab === 0} onClick={() => setActiveTab(0)} />
        <TabButton icon={Calendar} label="Calendar" isActive={activeTab === 1} onClick={() => setActiveTab(1)} />
        {/* <TabButton icon={Users} label="Community" isActive={activeTab === 2} onClick={() => setActiveTab(2)} /> */}
        <TabButton icon={User} label="Profile" isActive={activeTab === 3} onClick={() => setActiveTab(3)} />
      </div>
    </div>
  </ThemeContext.Provider>
);
  }

  export default App;