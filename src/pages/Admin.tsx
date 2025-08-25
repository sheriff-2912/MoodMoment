import React, { useState, useEffect } from 'react';
import { Users, Eye, Calendar, TrendingUp, ChevronRight, Brain, Heart, Battery, Zap } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Mood = Database['public']['Tables']['moods']['Row'];

const moodIcons = {
  stressed: { icon: Brain, color: 'text-red-500', bg: 'bg-red-100', label: 'Stressed' },
  tired: { icon: Battery, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Tired' },
  focused: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Focused' },
  happy: { icon: Heart, color: 'text-green-500', bg: 'bg-green-100', label: 'Happy' },
};

export function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoods, setLoadingMoods] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem('moodmoment_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserMoods(userId: string) {
    setLoadingMoods(true);
    try {
      const token = localStorage.getItem('moodmoment_token');
      const response = await fetch(`/api/admin/user/${userId}/moods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserMoods(data);
      }
    } catch (error) {
      console.error('Error fetching user moods:', error);
    } finally {
      setLoadingMoods(false);
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchUserMoods(user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and view mood analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Users ({users.length})
              </h2>
            </div>

            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-green-100 border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </div>
                      {user.is_admin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{selectedUser.full_name}</h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>Viewing user data</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                        <p className="text-2xl font-bold text-gray-900">{userMoods.length}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Member Since</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {format(new Date(selectedUser.created_at), 'MMM yyyy')}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Account Type</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedUser.is_admin ? 'Admin' : 'User'}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Moods */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Mood History
                </h3>

                {loadingMoods ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : userMoods.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userMoods.map((mood) => {
                      const MoodIcon = moodIcons[mood.mood].icon;
                      return (
                        <div key={mood.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-lg ${moodIcons[mood.mood].bg}`}>
                            <MoodIcon className={`h-4 w-4 ${moodIcons[mood.mood].color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">
                                {moodIcons[mood.mood].label}
                              </span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(mood.created_at), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            {mood.note && (
                              <p className="text-sm text-gray-600 mt-1">{mood.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No mood check-ins yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Select a User</h3>
              <p className="text-gray-600">Choose a user from the list to view their mood history and analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}