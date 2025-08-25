import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Battery, Zap, MessageSquare, CheckCircle } from 'lucide-react';
import { useMoods, getMoodSuggestions } from '../hooks/useMoods';
import toast from 'react-hot-toast';

type MoodType = 'stressed' | 'tired' | 'focused' | 'happy';

const moods: Array<{
  type: MoodType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}> = [
  {
    type: 'stressed',
    label: 'Stressed',
    icon: Brain,
    color: 'text-red-600',
    bgColor: 'bg-red-100 hover:bg-red-200 border-red-200',
    description: 'Feeling overwhelmed or anxious',
  },
  {
    type: 'tired',
    label: 'Tired',
    icon: Battery,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 hover:bg-orange-200 border-orange-200',
    description: 'Low energy or sleepy',
  },
  {
    type: 'focused',
    label: 'Focused',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
    description: 'Alert and concentrated',
  },
  {
    type: 'happy',
    label: 'Happy',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-100 hover:bg-green-200 border-green-200',
    description: 'Positive and content',
  },
];

export function CheckIn() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addMood } = useMoods();
  const navigate = useNavigate();

  const handleMoodSelect = (moodType: MoodType) => {
    setSelectedMood(moodType);
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    setLoading(true);
    const result = await addMood(selectedMood, note);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Mood check-in recorded!');
      setShowSuggestions(true);
    }

    setLoading(false);
  };

  const suggestions = selectedMood ? getMoodSuggestions(selectedMood) : [];

  if (showSuggestions) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Check-in Complete!</h1>
          <p className="text-gray-600">Here are some personalized wellness suggestions for you:</p>
        </div>

        <div className="space-y-4 mb-8">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl flex-shrink-0">{suggestion.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{suggestion.title}</h3>
                  <p className="text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full text-sm text-green-700 font-medium">
                    ⏱️ {suggestion.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              setSelectedMood(null);
              setNote('');
              setShowSuggestions(false);
            }}
            className="px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Another Check-in
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">How are you feeling?</h1>
        <p className="text-gray-600 text-lg">
          Take a moment to check in with yourself. Your wellness matters.
        </p>
      </div>

      {/* Mood Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.type;
          return (
            <button
              key={mood.type}
              onClick={() => handleMoodSelect(mood.type)}
              className={`p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${mood.bgColor} border-current ${mood.color} scale-105`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Icon className={`h-12 w-12 ${isSelected ? mood.color : 'text-gray-400'}`} />
                <div>
                  <h3 className={`text-lg font-semibold ${isSelected ? mood.color : 'text-gray-700'}`}>
                    {mood.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{mood.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Note */}
      <div className="mb-8">
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
          Add a note (optional)
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
            placeholder="What's on your mind? (Optional)"
            maxLength={500}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">
          {note.length}/500 characters
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedMood || loading}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? 'Recording...' : 'Record Check-in'}
        </button>
      </div>
    </div>
  );
}