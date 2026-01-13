import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Award, TrendingUp, Mail, UserPlus, Linkedin, Github, Globe, Video, Copy, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TeamDetails = () => {
  const { id } = useParams();
  const { participant: currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/teams/${id}`);
      setTeam(response.data.team);
      setMeetingLink(response.data.team.meetingLink || '');
    } catch (error) {
      toast.error('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const sendJoinRequest = async () => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }
    if (currentUser.teamId) {
      toast.error('You are already in a team');
      return;
    }

    setRequesting(true);
    try {
      await api.post(`/teams/${id}/join-request`, { message });
      toast.success('Join request sent successfully!');
      setShowRequestModal(false);
      setMessage('');
      fetchTeamDetails(); // Refresh to show updated request status
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send join request');
    } finally {
      setRequesting(false);
    }
  };

  const generateGoogleMeet = () => {
    // Open Google Meet in new tab to create instant meeting
    const meetWindow = window.open('https://meet.new', '_blank');
    setShowMeetingModal(true);
    toast.success('Create your meeting and paste the link here');
  };

  const saveMeetingLink = async () => {
    try {
      await api.patch(`/teams/${id}/meeting-link`, { meetingLink });
      toast.success('Meeting link saved!');
      setShowMeetingModal(false);
      fetchTeamDetails();
    } catch (error) {
      toast.error('Failed to save meeting link');
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Team not found</p>
      </div>
    );
  }

  const allMembers = [team.leader, ...team.members.map(m => m.participant)];
  
  const isTeamMember = currentUser && currentUser.teamId && (
    currentUser.teamId === team._id || 
    currentUser.teamId === team._id.toString() ||
    team._id === currentUser.teamId ||
    team._id.toString() === currentUser.teamId.toString()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            <p className="text-primary-100">{team.description || 'No description'}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-white/20 px-4 py-2 rounded-lg">
                {team.members.length + 1} / {team.maxMembers} Members
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-lg">
                Balance Score: {team.balanceScore}/100
              </span>
            </div>
          </div>
          {/* Request to Join Button */}
          {currentUser && !isTeamMember && !currentUser.teamId && (team.members.length + 1) < team.maxMembers && (
            <button
              onClick={() => setShowRequestModal(true)}
              disabled={team.joinRequests?.some(req => req.participant._id === currentUser._id && req.status === 'Pending')}
              className={`${team.joinRequests?.some(req => req.participant._id === currentUser._id && req.status === 'Pending') ? 'bg-gray-400 cursor-not-allowed' : 'bg-white text-primary-600 hover:bg-primary-50'} px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-4`}
            >
              <UserPlus className="w-5 h-5" />
              <span>{team.joinRequests?.some(req => req.participant._id === currentUser._id && req.status === 'Pending') ? 'Request Sent' : 'Request to Join'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Google Meet Section */}
      {isTeamMember && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Team Video Meeting</h3>
                <p className="text-sm text-gray-600">Connect with your team via Google Meet</p>
              </div>
            </div>
            {meetingLink ? (
              <div className="flex space-x-2">
                <button
                  onClick={copyMeetingLink}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                >
                  <Video className="w-5 h-5" />
                  <span>Join Meeting</span>
                </a>
                {(team.leader._id === currentUser._id || team.leader._id === currentUser.id) && (
                  <button
                    onClick={() => setShowMeetingModal(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            ) : (
              (team.leader._id === currentUser._id || team.leader._id === currentUser.id) && (
                <button
                  onClick={generateGoogleMeet}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Google Meet</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Balance Score Breakdown */}
      {team.balanceBreakdown && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Award className="w-6 h-6 text-primary-600" />
            <span>Team Balance Analysis</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <p className="text-3xl font-bold text-primary-600 mb-1">
                {team.balanceBreakdown.roleDiversity}
              </p>
              <p className="text-sm text-gray-600">Role Diversity (35 max)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600 mb-1">
                {team.balanceBreakdown.skillSpread}
              </p>
              <p className="text-sm text-gray-600">Skill Spread (40 max)</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 mb-1">
                {team.balanceBreakdown.softSkillCoverage}
              </p>
              <p className="text-sm text-gray-600">Soft Skills (25 max)</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6 text-primary-600" />
          <span>Team Members</span>
        </h2>
        <div className="space-y-4">
          {allMembers.map((member, index) => (
            <div key={member._id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold">{member.name}</h3>
                  {index === 0 && (
                    <span className="text-xs badge bg-yellow-100 text-yellow-700">Team Lead</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{member.rolePreference}</p>
                {member.technicalSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.technicalSkills.map((skill, idx) => (
                      <span key={idx} className="text-xs badge-primary">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Join Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRequestModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Request to Join Team</h2>
                <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Send a request to join <strong>{team.name}</strong>. The team leader will review your profile and decide whether to approve your request.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the team leader why you'd like to join and what you can contribute..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="4"
                  maxLength="500"
                />
                <p className="text-sm text-gray-500 mt-1">{message.length}/500 characters</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary flex-1"
                  disabled={requesting}
                >
                  Cancel
                </button>
                <button
                  onClick={sendJoinRequest}
                  disabled={requesting}
                  className="btn-primary flex-1"
                >
                  {requesting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Meeting Link Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMeetingModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Set Google Meet Link</h2>
                <button onClick={() => setShowMeetingModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 How to create:</strong><br/>
                    1. Click the button below to open Google Meet<br/>
                    2. A new meeting will be created automatically<br/>
                    3. Copy the meeting link from your browser<br/>
                    4. Paste it in the field below
                  </p>
                </div>

                <button
                  onClick={generateGoogleMeet}
                  className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <Video className="w-5 h-5" />
                  <span>Open Google Meet</span>
                </button>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMeetingLink}
                  disabled={!meetingLink}
                  className="btn-primary flex-1"
                >
                  Save Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;
