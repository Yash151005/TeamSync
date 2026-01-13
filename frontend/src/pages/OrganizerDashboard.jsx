import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [skillDistribution, setSkillDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, skillsRes] = await Promise.all([
        api.get('/organizer/dashboard'),
        api.get('/organizer/skill-distribution'),
      ]);
      setDashboard(dashboardRes.data);
      setSkillDistribution(skillsRes.data);
    } catch (error) {
      toast.error('Failed to load organizer dashboard');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <BarChart3 className="w-8 h-8" />
          <span>Organizer Dashboard 📊</span>
        </h1>
        <p className="text-primary-100">Analytics and insights for hackathon organizers</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">
              {dashboard?.overview.totalParticipants || 0}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">Total Participants</p>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">
              {dashboard?.overview.availableParticipants || 0}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">Available</p>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-purple-600">
              {dashboard?.overview.totalTeams || 0}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">Total Teams</p>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-yellow-600">
              {dashboard?.overview.soloParticipantsCount || 0}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">Need Teams</p>
        </div>
      </div>

      {/* Solo Participants Alert */}
      {dashboard?.alerts.soloParticipants.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <span>Participants Needing Teams</span>
          </h2>
          <div className="space-y-3">
            {dashboard.alerts.soloParticipants.slice(0, 5).map((participant) => (
              <div key={participant.id} className="bg-white p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-gray-600">{participant.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {participant.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-xs badge-primary">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-yellow-600">{participant.daysSolo}</span>
                  <p className="text-xs text-gray-600">days solo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Distribution */}
      {skillDistribution?.roleDistribution && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Role Distribution</h2>
          <div className="space-y-3">
            {skillDistribution.roleDistribution.map((role) => (
              <div key={role.role} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{role.role}</span>
                    <span className="text-sm text-gray-600">
                      {role.count} ({role.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all"
                      style={{ width: `${role.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Skills */}
      {skillDistribution?.skillHeatmap && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Top Technical Skills</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillDistribution.skillHeatmap.slice(0, 12).map((skill) => (
              <div
                key={skill.skill}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{skill.skill}</span>
                <span className="badge-primary">{skill.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Shortages */}
      {skillDistribution?.shortages && skillDistribution.shortages.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <span>Role Shortages (Less than 15%)</span>
          </h2>
          <div className="space-y-2">
            {skillDistribution.shortages.map((shortage) => (
              <div key={shortage.role} className="bg-white p-3 rounded-lg flex items-center justify-between">
                <span className="font-medium">{shortage.role}</span>
                <span className="text-red-600 font-bold">
                  {shortage.count} ({shortage.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Teams */}
      {dashboard?.recentTeams && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Teams</h2>
          <div className="space-y-3">
            {dashboard.recentTeams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold">{team.name}</p>
                  <p className="text-sm text-gray-600">
                    {team.memberCount} members • Created {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <span className={`text-2xl font-bold ${
                    team.balanceScore >= 80 ? 'text-green-600' :
                    team.balanceScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {team.balanceScore}
                  </span>
                  <p className="text-xs text-gray-600">balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
