import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Type, List, Grid3x3, ChevronDown, Star, Calendar, Mail, Upload, 
  CreditCard, Move, Copy, Trash2, X, Camera, Mic, Play, MapPin, 
  Gauge, Brain, MessageCircle, Zap, Award, Timer, Users
} from 'lucide-react';

// AI Validation Component
const AIValidation = ({ value, validationType, onValidationResult }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState(null);

  const performAIValidation = useCallback(async (text, type) => {
    setIsValidating(true);
    try {
      // Simulate AI validation API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let validationResult = { isValid: true, suggestions: [], score: 100 };
      
      switch (type) {
        case 'ai-plagiarism':
          validationResult = {
            isOriginal: Math.random() > 0.2,
            similarityScore: Math.floor(Math.random() * 30) + 10,
            sources: ['Wikipedia', 'Academic Paper #1', 'Blog Post']
          };
          break;
        case 'domain-verify':
          validationResult = {
            isValid: text.includes('@') && text.includes('.'),
            domain: text.split('@')[1],
            isActive: Math.random() > 0.3,
            riskScore: Math.floor(Math.random() * 100)
          };
          break;
      }
      
      setResult(validationResult);
      onValidationResult(validationResult);
    } catch (error) {
      console.error('AI validation error:', error);
    }
    setIsValidating(false);
  }, [onValidationResult]);

  useEffect(() => {
    if (value && value.length > 10) {
      const debounceTimer = setTimeout(() => {
        performAIValidation(value, validationType);
      }, 2000);
      return () => clearTimeout(debounceTimer);
    }
  }, [value, validationType, performAIValidation]);

  if (!value || value.length < 10) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-2 mb-2">
        <Brain className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium">AI Validation</span>
        {isValidating && (
          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        )}
      </div>
      
      {result && (
        <div className="space-y-2">
          {validationType === 'ai-grammar' && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Grammar Score</span>
                <span className={`text-xs font-medium ${result.score > 80 ? 'text-green-600' : result.score > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {result.score}%
                </span>
              </div>
              {result.suggestions.length > 0 && (
                <div className="text-xs text-gray-600">
                  <strong>Suggestions:</strong>
                  <ul className="mt-1 ml-3 list-disc">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {validationType === 'ai-sentiment' && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Sentiment</span>
                <span className={`text-xs font-medium capitalize ${
                  result.sentiment === 'positive' ? 'text-green-600' : 
                  result.sentiment === 'negative' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {result.sentiment} ({result.confidence}% confidence)
                </span>
              </div>
              <div className="text-xs text-gray-600">
                <strong>Emotions:</strong> {result.emotions.join(', ')}
              </div>
            </div>
          )}
          
          {validationType === 'ai-plagiarism' && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Originality</span>
                <span className={`text-xs font-medium ${result.isOriginal ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isOriginal ? 'Original' : `${result.similarityScore}% similar`}
                </span>
              </div>
              {!result.isOriginal && (
                <div className="text-xs text-gray-600">
                  <strong>Similar sources:</strong> {result.sources.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};  


export default AIValidation;