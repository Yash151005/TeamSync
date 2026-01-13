import { useState, useEffect } from 'react';
import { Search, Filter, X, TrendingUp, Sparkles, Eye, Mail, Award, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Discovery = () => {
  const { participant: currentUser } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    rolePreference: '',
    experienceLevel: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [skillGap, setSkillGap] = useState(null);
  const [inviteData, setInviteData] = useState({ role: '', message: '' });
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.rolePreference) params.append('rolePreference', filters.rolePreference);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);

      const response = await api.get(`/participants?${params.toString()}`);
      // Filter out the current user from the list
      const filteredParticipants = response.data.participants.filter(
        p => p._id !== currentUser?._id && p._id !== currentUser?.id
      );
      setParticipants(filteredParticipants);
    } catch (error) {
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchParticipants();
  };

  const clearFilters = () => {
    setFilters({ search: '', rolePreference: '', experienceLevel: '' });
    setTimeout(() => fetchParticipants(), 100);
  };

  const viewParticipantDetails = async (participant) => {
    setSelectedParticipant(participant);
    setShowDetailsModal(true);
    
    // Fetch skill gap if user has a team
    if (currentUser?.teamId) {
      try {
        const response = await api.get(`/participants/${participant._id}/skill-gap/${currentUser.teamId}`);
        setSkillGap(response.data.compatibility);
      } catch (error) {
        console.error('Failed to fetch skill gap:', error);
      }
    }
  };

  const openInviteModal = (participant) => {
    setSelectedParticipant(participant);
    setInviteData({ role: participant.rolePreference, message: '' });
    setShowInviteModal(true);
  };

  const sendInvite = async () => {
    if (!currentUser?.teamId) {
      toast.error('You need to create a team first');
      return;
    }

    setSendingInvite(true);
    try {
      await api.post(`/teams/${currentUser.teamId}/invite`, {
        participantId: selectedParticipant._id,
        role: inviteData.role,
        message: inviteData.message,
      });
      toast.success(`Invite sent to ${selectedParticipant.name}!`);
      setShowInviteModal(false);
      setInviteData({ role: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <h1 className="text-3xl font-bold mb-2">Discover Teammates 🔍</h1>
        <p className="text-primary-100">
          Find participants with the skills and experience you need
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input pl-10"
              placeholder="Search by name or bio..."
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <select
              value={filters.rolePreference}
              onChange={(e) => setFilters({ ...filters, rolePreference: e.target.value })}
              className="input"
            >
              <option value="">All Roles</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="ML/AI">ML/AI</option>
              <option value="Product Manager">Product Manager</option>
            </select>

            <select
              value={filters.experienceLevel}
              onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
              className="input"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            <button onClick={clearFilters} className="btn-secondary flex items-center justify-center space-x-2">
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : participants.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No participants found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found <span className="font-bold text-primary-600">{participants.length}</span> participants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants.map((participant) => (
              <div key={participant._id} className="card hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => viewParticipantDetails(participant)}>
                {/* Boosted Badge */}
                {participant.visibilityBoost?.isBoost && (
                  <div className="mb-3">
                    <span className="badge bg-yellow-100 text-yellow-700 flex items-center space-x-1 w-fit">
                      <Sparkles className="w-4 h-4" />
                      <span>Needs Team</span>
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-xl">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{participant.name}</h3>
                  <p className="text-sm text-gray-600">{participant.rolePreference}</p>
                  <span className="badge-primary text-xs mt-2 inline-block">
                    {participant.experienceLevel}
                  </span>
                </div>

                {participant.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{participant.bio}</p>
                )}

                <div className="space-y-3">
                  {participant.technicalSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Technical Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {participant.technicalSkills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="text-xs badge-primary">{skill}</span>
                        ))}
                        {participant.technicalSkills.length > 5 && (
                          <span className="text-xs badge-primary">
                            +{participant.technicalSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {participant.softSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Soft Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {participant.softSkills.map((skill, idx) => (
                          <span key={idx} className="text-xs badge-success">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1 text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>{participant.profileViews || 0} views</span>
                  </span>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); viewParticipantDetails(participant); }}
                      className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {currentUser?.teamId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openInviteModal(participant); }}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Send Invite"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Participant Details Modal */}
      {showDetailsModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedParticipant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedParticipant.name}</h2>
                    <p className="text-gray-600">{selectedParticipant.rolePreference}</p>
                    <span className="badge-primary text-sm mt-1 inline-block">{selectedParticipant.experienceLevel}</span>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedParticipant.bio && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">About</h3>
                  <p className="text-gray-600">{selectedParticipant.bio}</p>
                </div>
              )}

              {selectedParticipant.linkedinUrl && (
                <div className="mb-6">
                  <a 
                    href={selectedParticipant.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              )}

              {selectedParticipant.githubUrl && (
                <div className="mb-6">
                  <a 
                    href={selectedParticipant.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-gray-800 hover:text-gray-900 font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              )}

              {selectedParticipant.portfolioUrl && (
                <div className="mb-6">
                  <a 
                    href={selectedParticipant.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span>Portfolio</span>
                  </a>
                </div>
              )}

              <div className="space-y-4">
                {selectedParticipant.technicalSkills?.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipant.technicalSkills.map((skill, idx) => (
                        <span key={idx} className="badge-primary">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedParticipant.interests?.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipant.interests.map((interest, idx) => (
                        <span key={idx} className="badge-success">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedParticipant.softSkills?.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipant.softSkills.map((skill, idx) => (
                        <span key={idx} className="badge-warning">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {skillGap && (
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                    <h3 className="font-bold mb-3 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-primary-600" />
                      <span>Compatibility Analysis</span>
                    </h3>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Compatibility Score</span>
                        <span className="text-2xl font-bold text-primary-600">{skillGap.score}/100</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3">
                        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all" style={{ width: `${skillGap.score}%` }} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{skillGap.recommendation}</p>
                    </div>
                    
                    {skillGap.newSkills?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">New Skills They Bring:</p>
                        <div className="flex flex-wrap gap-1">
                          {skillGap.newSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs badge bg-blue-100 text-blue-700">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {skillGap.matchingSkills?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Matching Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {skillGap.matchingSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs badge bg-green-100 text-green-700">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                {currentUser?.teamId && (
                  <button onClick={() => { setShowDetailsModal(false); openInviteModal(selectedParticipant); }} className="btn-primary flex-1">
                    <Mail className="w-5 h-5 mr-2 inline" />
                    Send Team Invite
                  </button>
                )}
                <button onClick={() => setShowDetailsModal(false)} className="btn-secondary flex-1">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Send Team Invite</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedParticipant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">{selectedParticipant.name}</p>
                    <p className="text-sm text-gray-600">{selectedParticipant.rolePreference}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })} className="input">
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="ML/AI">ML/AI</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Open to Any">Open to Any</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea value={inviteData.message} onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })} className="input" rows={4} maxLength={500} placeholder="Tell them why they'd be a great fit for your team..." />
                  <p className="text-sm text-gray-500 mt-1">{inviteData.message.length}/500</p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button onClick={sendInvite} disabled={sendingInvite} className="btn-primary flex-1">
                  {sendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
                <button onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">
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

export default Discovery;
