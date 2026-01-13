import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, TrendingUp, Award, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Teams = () => {
  const navigate = useNavigate();
  const { participant } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    requiredSkills: [],
    maxMembers: 4,
  });
  const [skillInput, setSkillInput] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teams');
      setTeams(response.data.teams || []);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !teamData.requiredSkills.includes(skillInput.trim())) {
      setTeamData({
        ...teamData,
        requiredSkills: [...teamData.requiredSkills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setTeamData({
      ...teamData,
      requiredSkills: teamData.requiredSkills.filter((s) => s !== skill),
    });
  };

  const createTeam = async () => {
    if (!teamData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/teams', teamData);
      toast.success('Team created successfully!');
      setShowCreateModal(false);
      setTeamData({ name: '', description: '', requiredSkills: [], maxMembers: 4 });
      fetchTeams();
      navigate(`/teams/${response.data.team._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teams 👥</h1>
            <p className="text-primary-100">Browse existing teams or create your own</p>
          </div>
          {participant && !participant.teamId && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center hover:shadow-lg transition-all">
          <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{teams.length}</p>
          <p className="text-gray-600 text-sm">Total Teams</p>
        </div>
        <div className="card text-center hover:shadow-lg transition-all">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{teams.filter(t => (t.members?.length || 0) < t.maxMembers).length}</p>
          <p className="text-gray-600 text-sm">Looking for Members</p>
        </div>
        <div className="card text-center hover:shadow-lg transition-all">
          <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{teams.filter(t => (t.balanceScore || 0) >= 70).length}</p>
          <p className="text-gray-600 text-sm">Well-Balanced</p>
        </div>
        <div className="card text-center hover:shadow-lg transition-all">
          <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{teams.filter(t => (t.members?.length || 0) >= t.maxMembers).length}</p>
          <p className="text-gray-600 text-sm">Full Teams</p>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-4">Be the first to create a team!</p>
          {participant && !participant.teamId && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="w-5 h-5 mr-2 inline" />
              Create Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              onClick={() => navigate(`/teams/${team._id}`)}
              className="card hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-transparent hover:border-primary-500 relative overflow-hidden"
            >
              {/* Badge for full teams */}
              {(team.members?.length || 0) >= team.maxMembers && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Full
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary-600 transition-colors">{team.name}</h3>
                  <p className="text-sm text-gray-500">Led by {team.leader?.name || 'Unknown'}</p>
                </div>
              </div>

              {team.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.description}</p>
              )}

              {/* Skills */}
              {team.requiredSkills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {team.requiredSkills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="badge bg-gray-100 text-gray-700 text-xs">
                        {skill}
                      </span>
                    ))}
                    {team.requiredSkills.length > 5 && (
                      <span className="badge bg-gray-100 text-gray-700 text-xs">
                        +{team.requiredSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {(team.members?.length || 0) + 1}/{team.maxMembers}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className={`w-4 h-4 ${(team.balanceScore || 0) >= 70 ? 'text-green-500' : (team.balanceScore || 0) >= 40 ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {team.balanceScore || 0}/100
                  </span>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Create Your Team</h2>
                    <p className="text-gray-600">Start building your dream hackathon team</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamData.name}
                    onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Code Warriors"
                    maxLength={50}
                  />
                  <p className="text-sm text-gray-500 mt-1">{teamData.name.length}/50</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={teamData.description}
                    onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                    className="input"
                    rows={4}
                    placeholder="Describe your team's vision, goals, or project idea..."
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">{teamData.description.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="input flex-1"
                      placeholder="e.g., React, Python, Figma"
                    />
                    <button onClick={addSkill} type="button" className="btn-primary px-6">
                      Add
                    </button>
                  </div>
                  {teamData.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teamData.requiredSkills.map((skill, idx) => (
                        <span key={idx} className="badge-primary flex items-center space-x-1">
                          <span>{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:bg-primary-700 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Team Size
                  </label>
                  <select
                    value={teamData.maxMembers}
                    onChange={(e) => setTeamData({ ...teamData, maxMembers: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                    <option value={5}>5 Members</option>
                    <option value={6}>6 Members</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={createTeam}
                  disabled={creating}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Team'}
                </button>
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
