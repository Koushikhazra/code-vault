import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Code, Eye, EyeOff, Edit, Trash2, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

export function QuestionsPage() {
  const { questions, topics, addQuestion, updateQuestion, deleteQuestion } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCode, setExpandedCode] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    difficulty: 'Easy',
    code: '',
    notes: ''
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = question.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = topicFilter === 'all' || question.topic === topicFilter;
      const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'revised') {
        matchesStatus = question.isRevised;
      } else if (statusFilter === 'not-revised') {
        matchesStatus = !question.isRevised;
      } else if (statusFilter === 'not-revised-7-days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesStatus = !question.lastRevisedDate || new Date(question.lastRevisedDate) < sevenDaysAgo;
      }
      
      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
    });
  }, [questions, searchQuery, topicFilter, difficultyFilter, statusFilter]);

  // Group questions by topic
  const questionsByTopic = useMemo(() => {
    const grouped = {};
    filteredQuestions.forEach(question => {
      if (!grouped[question.topic]) {
        grouped[question.topic] = [];
      }
      grouped[question.topic].push(question);
    });
    return grouped;
  }, [filteredQuestions]);

  const resetForm = () => {
    setFormData({
      name: '',
      topic: '',
      difficulty: 'Easy',
      code: '',
      notes: ''
    });
  };

  const handleAddQuestion = () => {
    if (!formData.name.trim() || !formData.topic.trim()) return;
    
    addQuestion({
      ...formData,
      isRevised: false,
      lastRevisedDate: null
    });
    
    resetForm();
    setShowAddModal(false);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      name: question.name,
      topic: question.topic,
      difficulty: question.difficulty,
      code: question.code,
      notes: question.notes
    });
    setShowAddModal(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !formData.name.trim() || !formData.topic.trim()) return;
    
    updateQuestion(editingQuestion._id, formData);
    resetForm();
    setEditingQuestion(null);
    setShowAddModal(false);
  };

  const handleToggleRevised = (questionId, isRevised) => {
    updateQuestion(questionId, {
      isRevised,
      lastRevisedDate: isRevised ? new Date().toISOString() : null
    });
  };

  const toggleCodeExpansion = (questionId) => {
    const newExpanded = new Set(expandedCode);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedCode(newExpanded);
  };

  const toggleTopicExpansion = (topicName) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedTopics(newExpanded);
  };

  const getDifficultyColor = (difficulty) => {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingQuestion(null);
            setShowAddModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic
            </label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic._id} value={topic.name}>{topic.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Questions</option>
              <option value="revised">Revised</option>
              <option value="not-revised">Not Revised</option>
              <option value="not-revised-7-days">Not Revised (7+ days)</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Questions Grouped by Topic */}
      <div className="space-y-4">
        {Object.keys(questionsByTopic).length > 0 ? (
          Object.entries(questionsByTopic).map(([topicName, topicQuestions]) => {
            const isExpanded = expandedTopics.has(topicName);
            const revisedCount = topicQuestions.filter(q => q.isRevised).length;
            
            return (
              <div key={topicName} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {/* Topic Header */}
                <button
                  onClick={() => toggleTopicExpansion(topicName)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {topicName}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {revisedCount}/{topicQuestions.length} revised
                    </span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(revisedCount / topicQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </button>

                {/* Questions Table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Revised
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Question Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Difficulty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Last Revised
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {topicQuestions.map((question) => (
                          <React.Fragment key={question._id}>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-4">
                                <input
                                  type="checkbox"
                                  checked={question.isRevised}
                                  onChange={(e) => handleToggleRevised(question._id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {question.name}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {question.code && (
                                  <button
                                    onClick={() => toggleCodeExpansion(question._id)}
                                    className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    {expandedCode.has(question._id) ? (
                                      <>
                                        <EyeOff className="w-4 h-4 mr-1" />
                                        Hide Code
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4 mr-1" />
                                        Show Code
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                  {question.notes || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  {question.lastRevisedDate ? (
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {new Date(question.lastRevisedDate).toLocaleDateString()}
                                    </div>
                                  ) : (
                                    'Never'
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditQuestion(question)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Edit Question"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(question._id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {expandedCode.has(question._id) && question.code && (
                              <tr>
                                <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-700">
                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                      <Code className="w-4 h-4 mr-2" />
                                      Code Solution
                                    </div>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                      <code>{question.code}</code>
                                    </pre>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {questions.length === 0 
                ? "Add your first question to get started!"
                : "Try adjusting your filters or search query."
              }
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter question name..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topic *
                    </label>
                    <input
                      type="text"
                      list="topics-list"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter topic name (e.g., Arrays, Trees)..."
                    />
                    <datalist id="topics-list">
                      {topics.map(topic => (
                        <option key={topic._id} value={topic.name} />
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Type a new topic name or select from existing ones
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code Solution
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Enter your code solution..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add any notes or explanations..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                  disabled={!formData.name.trim() || !formData.topic.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}