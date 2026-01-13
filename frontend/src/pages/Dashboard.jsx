import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Award, Bell, ArrowRight, Sparkles, Search, UserPlus, Target, Eye, Clock, Linkedin, Github, Globe } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { participant, updateParticipant } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [invites, setInvites] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchSuggestedMatches();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's team if they have one
      if (participant?.teamId) {
        const teamResponse = await api.get(`/teams/${participant.teamId}`);
        setStats({ team: teamResponse.data.team });
        
        // Check for pending invites
        const pendingInvites = teamResponse.data.team.pendingInvites?.filter(
          inv => inv.status === 'Pending' && inv.participant._id === participant.id
        ) || [];
        setInvites(pendingInvites);

        // Check for join requests (if team leader)
        const leaderId = typeof teamResponse.data.team.leader === 'object' 
          ? teamResponse.data.team.leader._id 
          : teamResponse.data.team.leader;
        const currentUserId = participant._id || participant.id;
        
        if (leaderId === currentUserId || leaderId.toString() === currentUserId.toString()) {
          const pendingJoinRequests = teamResponse.data.team.joinRequests?.filter(
            req => req.status === 'Pending'
          ) || [];
          setJoinRequests(pendingJoinRequests);
          console.log('Join requests for leader:', pendingJoinRequests);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedMatches = async () => {
    try {
      const response = await api.get('/participants', {
        params: {
          rolePreference: participant?.rolePreference,
          limit: 3
        }
      });
      setSuggestedMatches(response.data.participants?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = participant.availability.status === 'Available' ? 'Not Available' : 'Available';
      const response = await api.patch('/participants/availability', { status: newStatus });
      updateParticipant({ availability: response.data.availability });
      toast.success(`You are now ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleInviteResponse = async (teamId, inviteId, action) => {
    try {
      await api.post(`/teams/${teamId}/${action}/${inviteId}`);
      toast.success(`Invite ${action === 'accept' ? 'accepted' : 'declined'}!`);
      fetchDashboardData();
      if (action === 'accept') {
        updateParticipant({ teamId });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} invite`);
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      await api.post(`/teams/${participant.teamId}/join-request/${requestId}/${action}`);
      toast.success(`Join request ${action === 'approve' ? 'approved' : 'rejected'}!`);
      fetchDashboardData();
      setShowProfileModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} request`);
    }
  };

  const viewRequestProfile = (request) => {
    setSelectedRequest(request);
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const hasCompletedProfile = participant?.name && participant?.name !== participant?.email?.split('@')[0];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {participant?.name || 'Participant'}! 👋
            </h1>
            <p className="text-primary-100">
              {participant?.teamId 
                ? 'You are part of a team!' 
                : 'Ready to find your perfect hackathon team?'}
            </p>
          </div>
          <Sparkles className="w-16 h-16 text-white opacity-50" />
        </div>
      </div>

      {/* Action Required: Complete Profile */}
      {!hasCompletedProfile && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-4">
            <Bell className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-2">Complete Your Profile</h3>
              <p className="text-yellow-700 mb-4">
                Add your skills, interests, and preferences to start discovering teams!
              </p>
              <button onClick={() => navigate('/profile')} className="btn-primary inline-flex items-center space-x-2">
                <span>Complete Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Pending Team Invites ({invites.length})
          </h3>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite._id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Team Invitation</p>
                  <p className="text-sm text-gray-600">Role: {invite.role}</p>
                  {invite.message && (
                    <p className="text-sm text-gray-500 mt-1">&ldquo;{invite.message}&rdquo;</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInviteResponse(stats.team._id, invite._id, 'accept')}
                    className="btn-primary text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleInviteResponse(stats.team._id, invite._id, 'decline')}
                    className="btn-secondary text-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Requests (Team Leader Only) */}
      {joinRequests.length > 0 && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-bold text-green-900 mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Join Requests ({joinRequests.length})
          </h3>
          <div className="space-y-3">
            {joinRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {request.participant.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{request.participant.name}</p>
                      <p className="text-sm text-gray-600">{request.participant.rolePreference}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => viewRequestProfile(request)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Profile
                  </button>
                </div>
                {request.message && (
                  <p className="text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded">
                    &ldquo;{request.message}&rdquo;
                  </p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleJoinRequest(request._id, 'approve')}
                    className="btn-primary text-sm flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleJoinRequest(request._id, 'reject')}
                    className="btn-secondary text-sm flex-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Toggle */}
      {!participant?.teamId && hasCompletedProfile && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Looking for Team?</h3>
              <p className="text-gray-600">
                Toggle your availability to appear in discovery
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                participant?.availability?.status === 'Available'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {participant?.availability?.status === 'Available' ? '✓ Available' : 'Not Available'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Eye className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {participant?.profileViews || 0}
            </span>
          </div>
          <h3 className="font-medium text-gray-600">Profile Views</h3>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {invites.length}
            </span>
          </div>
          <h3 className="font-medium text-gray-600">Pending Invites</h3>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => stats?.team && navigate(`/teams/${stats.team._id}`)}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats?.team?.balanceScore || 'N/A'}
            </span>
          </div>
          <h3 className="font-medium text-gray-600">Team Balance</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate('/discovery')} className="card hover:shadow-lg transition-all group cursor-pointer text-left">
          <div className="p-3 bg-primary-100 rounded-lg w-fit mb-3">
            <Search className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-bold mb-1 group-hover:text-primary-600 transition-colors">
            Discover
          </h3>
          <p className="text-sm text-gray-600">Find teammates</p>
        </button>

        <button onClick={() => navigate('/teams')} className="card hover:shadow-lg transition-all group cursor-pointer text-left">
          <div className="p-3 bg-green-100 rounded-lg w-fit mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold mb-1 group-hover:text-green-600 transition-colors">
            Browse Teams
          </h3>
          <p className="text-sm text-gray-600">Explore teams</p>
        </button>

        <button onClick={() => navigate('/profile')} className="card hover:shadow-lg transition-all group cursor-pointer text-left">
          <div className="p-3 bg-purple-100 rounded-lg w-fit mb-3">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold mb-1 group-hover:text-purple-600 transition-colors">
            Edit Profile
          </h3>
          <p className="text-sm text-gray-600">Update your info</p>
        </button>

        {!participant?.teamId && (
          <button onClick={() => navigate('/teams')} className="card hover:shadow-lg transition-all group cursor-pointer text-left bg-gradient-to-br from-primary-50 to-secondary-50">
            <div className="p-3 bg-white rounded-lg w-fit mb-3">
              <UserPlus className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold mb-1 group-hover:text-primary-600 transition-colors">
              Create Team
            </h3>
            <p className="text-sm text-gray-600">Start your team</p>
          </button>
        )}
      </div>

      {/* Suggested Matches */}
      {!participant?.teamId && suggestedMatches.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>Suggested Matches</span>
            </h3>
            <button onClick={() => navigate('/discovery')} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {suggestedMatches.map((match) => (
              <div 
                key={match._id} 
                onClick={() => navigate('/discovery')}
                className="card hover:shadow-md transition-all cursor-pointer bg-gray-50"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{match.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-bold">{match.name}</p>
                    <p className="text-xs text-gray-600">{match.rolePreference}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {match.technicalSkills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="badge text-xs bg-primary-100 text-primary-700">{skill}</span>
                  ))}
                  {match.technicalSkills?.length > 3 && (
                    <span className="badge text-xs bg-primary-100 text-primary-700">+{match.technicalSkills.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Info */}
      {stats?.team && (
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50">
          <h3 className="font-bold text-xl mb-4 flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary-600" />
            <span>Your Team</span>
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-2xl text-primary-600">{stats.team.name}</h4>
              <p className="text-gray-600">{stats.team.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge-primary">
                {(stats.team.members?.length || 0) + 1} / {stats.team.maxMembers} Members
              </span>
              <span className={`badge ${stats.team.balanceScore >= 70 ? 'badge-success' : stats.team.balanceScore >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                Balance: {stats.team.balanceScore}/100
              </span>
              <span className="badge bg-purple-100 text-purple-700">
                <Clock className="w-3 h-3 inline mr-1" />
                Created {new Date(stats.team.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button onClick={() => navigate(`/teams/${stats.team._id}`)} className="btn-primary inline-flex items-center space-x-2">
              <span>View Team Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Profile View Modal */}
      {showProfileModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Profile Details</h2>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedRequest.participant.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedRequest.participant.name}</h3>
                    <p className="text-gray-600">{selectedRequest.participant.email}</p>
                    <p className="text-primary-600 font-medium">{selectedRequest.participant.rolePreference}</p>
                  </div>
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Message</h4>
                    <p className="text-blue-800">{selectedRequest.message}</p>
                  </div>
                )}

                {/* Social Links */}
                {(selectedRequest.participant.linkedinUrl || selectedRequest.participant.githubUrl || selectedRequest.participant.portfolioUrl) && (
                  <div>
                    <h4 className="font-bold mb-3">Social Profiles</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedRequest.participant.linkedinUrl && (
                        <a
                          href={selectedRequest.participant.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 font-medium"
                        >
                          <Linkedin className="w-5 h-5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {selectedRequest.participant.githubUrl && (
                        <a
                          href={selectedRequest.participant.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-800 font-medium"
                        >
                          <Github className="w-5 h-5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {selectedRequest.participant.portfolioUrl && (
                        <a
                          href={selectedRequest.participant.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-green-600 font-medium"
                        >
                          <Globe className="w-5 h-5" />
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {selectedRequest.participant.technicalSkills?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.participant.technicalSkills.map((skill, idx) => (
                        <span key={idx} className="badge-primary">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {selectedRequest.participant.softSkills?.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.participant.softSkills.map((skill, idx) => (
                        <span key={idx} className="badge bg-green-100 text-green-700">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleJoinRequest(selectedRequest._id, 'approve')}
                    className="btn-primary flex-1"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleJoinRequest(selectedRequest._id, 'reject')}
                    className="btn-secondary flex-1"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
