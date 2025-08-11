import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, CheckCircle, Code, Eye, EyeOff, Calendar } from 'lucide-react';
import { Question } from '../types';

export function RevisionPage() {
  const { getRandomQuestions, updateQuestion, questions } = useApp();
  const [revisionQuestions, setRevisionQuestions] = useState<Question[]>([]);
  const [expandedCode, setExpandedCode] = useState<Set<string>>(new Set());
  const [completedCount, setCompletedCount] = useState(0);

  const loadNewQuestions = () => {
    const newQuestions = getRandomQuestions(5);
    setRevisionQuestions(newQuestions);
    setExpandedCode(new Set());
    setCompletedCount(0);
  };

  useEffect(() => {
    loadNewQuestions();
  }, [questions]);

  const handleToggleRevised = (questionId: string, isRevised: boolean) => {
    updateQuestion(questionId, {
      isRevised,
      lastRevisedDate: isRevised ? new Date().toISOString() : null
    });

    // Update local state
    setRevisionQuestions(prev => 
      prev.map(q => 
        q._id === questionId 
          ? { ...q, isRevised, lastRevisedDate: isRevised ? new Date().toISOString() : null }
          : q
      )
    );

    // Update completed count
    if (isRevised) {
      setCompletedCount(prev => prev + 1);
    } else {
      setCompletedCount(prev => Math.max(0, prev - 1));
    }
  };

  const toggleCodeExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedCode);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedCode(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Revision</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Practice with 5 random questions to strengthen your skills
          </p>
        </div>
        
        <button
          onClick={loadNewQuestions}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Questions
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress: {completedCount}/5 Questions
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((completedCount / 5) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Questions */}
      {revisionQuestions.length > 0 ? (
        <div className="space-y-6">
          {revisionQuestions.map((question, index) => (
            <div
              key={question._id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 transition-all ${
                question.isRevised
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-blue-500'
              }`}
            >
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Question {index + 1}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {question.topic}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {question.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRevised}
                        onChange={(e) => handleToggleRevised(question._id, e.target.checked)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mark as Revised
                      </span>
                    </label>
                    
                    {question.isRevised && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Notes */}
                {question.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{question.notes}</p>
                  </div>
                )}

                {/* Code Section */}
                {question.code && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleCodeExpansion(question._id)}
                      className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3"
                    >
                      {expandedCode.has(question._id) ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Solution
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Show Solution
                        </>
                      )}
                    </button>

                    {expandedCode.has(question._id) && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Code className="w-4 h-4 mr-2" />
                          Code Solution
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{question.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Last Revised Info */}
                {question.lastRevisedDate && (
                  <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Last revised: {new Date(question.lastRevisedDate).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Completion Message */}
          {completedCount === 5 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                Great job! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-400 mb-4">
                You've completed all 5 questions in this revision session.
              </p>
              <button
                onClick={loadNewQuestions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Questions Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Add some questions first to start your revision session.
          </p>
          <button
            onClick={() => {/* Navigate to questions page */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Questions
          </button>
        </div>
      )}
    </div>
  );
}