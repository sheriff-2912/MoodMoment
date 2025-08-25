import React, { useEffect, useState } from 'react';
import { format, isToday, subDays } from 'date-fns';
import { Droplets, TrendingUp, Calendar, Brain, Heart, Battery, Zap, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMoods, getMoodSuggestions } from '../hooks/useMoods';
import { Link } from 'react-router-dom';
import type { Database } from '../lib/supabase';

type Mood = Database['public']['Tables']['moods']['Row'];

const moodIcons = {
  stressed: { icon: Brain, color: 'text-red-500', bg: 'bg-red-100', label: 'Stressed' },
  tired: { icon: Battery, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Tired' },
  focused: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Focused' },
  happy: { icon: Heart, color: 'text-green-500', bg: 'bg-green-100', label: 'Happy' },
};

export function Dashboard() {
  const { user } = useAuth();
  const { moods, loading } = useMoods();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const latestMood = moods.length > 0 ? moods[0] : null;
  const todayMoods = moods.filter(mood => isToday(new Date(mood.created_at)));
  const weekMoods = moods.filter(mood => {
    const moodDate = new Date(mood.created_at);
    return moodDate >= subDays(new Date(), 7);
  });

  useEffect(() => {
    if (latestMood) {
      const moodSuggestions = getMoodSuggestions(latestMood.mood);
      setSuggestions(moodSuggestions);
    }
  }, [latestMood]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMoodStats = () => {
    const moodCounts = weekMoods.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMoods = weekMoods.length;
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {getGreeting()}, {user?.full_name}!
        </h1>
        <p className="text-gray-600 text-lg">
          How are you feeling today? Let's check in on your wellness journey.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{todayMoods.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{weekMoods.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{moods.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Droplets className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Suggestions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-green-600" />
            AI Wellness Suggestions
          </h2>

          {latestMood ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600">Based on your latest mood:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${moodIcons[latestMood.mood].bg} ${moodIcons[latestMood.mood].color}`}>
                  {React.createElement(moodIcons[latestMood.mood].icon, { className: 'h-3 w-3 mr-1' })}
                  {moodIcons[latestMood.mood].label}
                </span>
              </div>

              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{suggestion.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{suggestion.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                      <div className="flex items-center mt-2 text-xs text-green-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {suggestion.duration}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No mood data yet</p>
              <Link
                to="/checkin"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Droplets className="h-4 w-4 mr-2" />
                Record Your First Check-in
              </Link>
            </div>
          )}
        </div>

        {/* Recent Mood History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Recent Check-ins
          </h2>

          {moods.length > 0 ? (
            <div className="space-y-4">
              {moods.slice(0, 5).map((mood) => {
                const MoodIcon = moodIcons[mood.mood].icon;
                return (
                  <div key={mood.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
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

              {moods.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    to="/history"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    View All Check-ins →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No check-ins yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Mood Distribution */}
      {weekMoods.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">This Week's Mood Distribution</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getMoodStats().map(({ mood, count, percentage }) => {
              const MoodIcon = moodIcons[mood as keyof typeof moodIcons].icon;
              return (
                <div key={mood} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`inline-flex p-3 rounded-lg mb-2 ${moodIcons[mood as keyof typeof moodIcons].bg}`}>
                    <MoodIcon className={`h-6 w-6 ${moodIcons[mood as keyof typeof moodIcons].color}`} />
                  </div>
                  <p className="font-medium text-gray-800">{moodIcons[mood as keyof typeof moodIcons].label}</p>
                  <p className="text-sm text-gray-600">{count} times ({percentage}%)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action */}
      <div className="text-center py-8">
        <Link
          to="/checkin"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Droplets className="h-5 w-5 mr-2" />
          New Mood Check-in
        </Link>
      </div>
    </div>
  );
}