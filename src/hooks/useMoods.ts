import { useState, useEffect } from 'react';
import type { Database } from '../lib/supabase';

type Mood = Database['public']['Tables']['moods']['Row'];
type MoodType = 'stressed' | 'tired' | 'focused' | 'happy';

interface MoodSuggestion {
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export function useMoods() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMoods();
  }, []);

  async function fetchMoods() {
    try {
      const token = localStorage.getItem('moodmoment_token');
      const response = await fetch('/api/moods', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMoods(data);
      } else {
        setError('Failed to fetch moods');
      }
    } catch (err) {
      setError('Failed to fetch moods');
    } finally {
      setLoading(false);
    }
  }

  async function addMood(mood: MoodType, note?: string) {
    try {
      const token = localStorage.getItem('moodmoment_token');
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mood, note: note || '' }),
      });

      if (response.ok) {
        const newMood = await response.json();
        setMoods(prev => [newMood, ...prev]);
        return { success: true };
      } else {
        return { error: 'Failed to add mood check-in' };
      }
    } catch (err) {
      return { error: 'Failed to add mood check-in' };
    }
  }

  async function getSuggestions(): Promise<MoodSuggestion[]> {
    try {
      const token = localStorage.getItem('moodmoment_token');
      const response = await fetch('/api/moods/suggest', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.suggestions || [];
      } else {
        return getDefaultSuggestions();
      }
    } catch (err) {
      return getDefaultSuggestions();
    }
  }

  function getDefaultSuggestions(): MoodSuggestion[] {
    return [
      {
        title: 'Take a Deep Breath',
        description: 'Practice mindful breathing to center yourself',
        duration: '2 min',
        icon: '🫁',
      },
      {
        title: 'Stretch Break',
        description: 'Stand up and do some gentle stretches',
        duration: '3 min',
        icon: '🤸‍♀️',
      },
      {
        title: 'Hydrate',
        description: 'Drink a glass of water to refresh yourself',
        duration: '1 min',
        icon: '💧',
      },
    ];
  }

  return {
    moods,
    loading,
    error,
    addMood,
    getSuggestions,
    refetch: fetchMoods,
  };
}

export function getMoodSuggestions(mood: MoodType): MoodSuggestion[] {
  const suggestions = {
    stressed: [
      {
        title: 'Box Breathing',
        description: 'Breathe in for 4, hold for 4, exhale for 4, hold for 4',
        duration: '1 min',
        icon: '🫁',
      },
      {
        title: 'Neck Stretch',
        description: 'Gently roll your neck to release tension',
        duration: '30 sec',
        icon: '💆‍♀️',
      },
      {
        title: 'Gaze Away',
        description: 'Look at something far away to rest your eyes',
        duration: '60 sec',
        icon: '👀',
      },
    ],
    tired: [
      {
        title: 'Stand & Stretch',
        description: 'Stand up and do some energizing stretches',
        duration: '60 sec',
        icon: '🤸‍♂️',
      },
      {
        title: 'Drink Water',
        description: 'Hydrate to boost your energy levels',
        duration: '1 min',
        icon: '💧',
      },
      {
        title: 'Brisk Walk',
        description: 'Take a quick walk to get your blood flowing',
        duration: '2 min',
        icon: '🚶‍♀️',
      },
    ],
    focused: [
      {
        title: 'Plan Next Goal',
        description: 'Set a micro-goal for the next 25 minutes',
        duration: '2 min',
        icon: '🎯',
      },
      {
        title: 'Pomodoro Break',
        description: 'Take a 5-minute break after 25 minutes of focus',
        duration: '5 min',
        icon: '⏰',
      },
      {
        title: 'Light Hydration',
        description: 'Take small sips of water to stay hydrated',
        duration: '30 sec',
        icon: '💧',
      },
    ],
    happy: [
      {
        title: 'Maintain Flow',
        description: 'Keep up the great work and stay in the zone',
        duration: '0 min',
        icon: '🌟',
      },
      {
        title: 'Gratitude Note',
        description: 'Write down something you\'re grateful for',
        duration: '2 min',
        icon: '📝',
      },
      {
        title: 'Posture Check',
        description: 'Adjust your posture for continued comfort',
        duration: '30 sec',
        icon: '🪑',
      },
    ],
  };

  return suggestions[mood];
}