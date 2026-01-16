import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2, TrendingUp, Users, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TeamRecommendations = () => {
  const { participant } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [compatibility, setCompatibility] = useState(null);
  const [analyzingTeam, setAnalyzingTeam] = useState(null);

  useEffect(() => {
    if (participant && !participant.teamId) {
      fetchRecommendations();
    }
  }, [participant]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai/recommend-teams');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      toast.error('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompatibility = async (team) => {
    setAnalyzingTeam(team._id);
    setSelectedTeam(team);
    try {
      const response = await api.get(`/ai/compatibility/${team._id}`);
      setCompatibility(response.data);
      setShowAnalysis(true);
    } catch (error) {
      toast.error('Failed to analyze compatibility');
    } finally {
      setAnalyzingTeam(null);
    }
  };

  const viewTeamDetails = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  if (participant?.teamId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <Users className="w-16 h-16 mx-auto text-primary-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">You're Already on a Team!</h2>
          <p className="text-gray-600 mb-4">
            You're currently part of a team. View your team details or explore other teams.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/teams/${participant.teamId}`)}
              className="btn-primary"
            >
              View My Team
            </button>
            <button
              onClick={() => navigate('/teams')}
              className="btn-secondary"
            >
              Browse Teams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI-Powered Team Recommendations</h1>
        </div>
        <p className="text-purple-100">
          Our AI has analyzed your profile and found the best team matches for you
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing teams for you...</p>
        </div>
      )}

      {/* No Recommendations */}
      {!loading && recommendations.length === 0 && (
        <div className="card text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 mb-4">
            Complete your profile to get personalized team recommendations
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Recommendations List */}
      <div className="grid gap-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.team?._id || index}
            className="card hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full">
                    #{index + 1} Match
                  </span>
                  <h3 className="text-2xl font-bold">{rec.team?.name || 'Unnamed Team'}</h3>
                </div>
                <p className="text-gray-600">{rec.team?.description || 'No description available'}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">
                  {rec.score}%
                </div>
                <p className="text-sm text-gray-500">Match Score</p>
              </div>
            </div>

            {/* Match Reasons */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Why this team?
              </h4>
              <p className="text-gray-600 text-sm">{rec.reason}</p>
            </div>

            {/* Team Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{(rec.team?.members?.length || 0) + 1} / {rec.team?.maxMembers || 4} members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Led by {rec.team?.leader?.name || 'Unknown'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => rec.team?._id && viewTeamDetails(rec.team._id)}
                className="btn-primary flex-1"
              >
                View Team Details
              </button>
              <button
                onClick={() => rec.team && analyzeCompatibility(rec.team)}
                disabled={analyzingTeam === rec.team?._id}
                className="btn-secondary flex items-center space-x-2"
              >
                {analyzingTeam === rec.team?._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Deep Analysis</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compatibility Analysis Modal */}
      {showAnalysis && compatibility && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
                  AI Compatibility Analysis
                </h3>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-semibold mb-2">{selectedTeam.name}</h4>
                <div className="text-center mb-4">
                  <div className="inline-block">
                    <div className="text-5xl font-bold text-primary-600 mb-2">
                      {compatibility.score}%
                    </div>
                    <p className="text-gray-600">Compatibility Score</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">✅ Strengths</h5>
                  <p className="text-green-700 text-sm">{compatibility.strengths}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">⚡ Areas to Consider</h5>
                  <p className="text-yellow-700 text-sm">{compatibility.considerations}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">💡 Recommendation</h5>
                  <p className="text-blue-700 text-sm">{compatibility.recommendation}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => viewTeamDetails(selectedTeam._id)}
                  className="btn-primary flex-1"
                >
                  View Team & Join
                </button>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRecommendations;
