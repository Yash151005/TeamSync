import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Search, BarChart3, LogOut, User, Home, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
  const { participant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/discovery', icon: Search, label: 'Discovery' },
    { to: '/teams', icon: Users, label: 'Teams' },
    { to: '/ai-recommendations', icon: Sparkles, label: 'AI Match', highlight: true },
    { to: '/organizer', icon: BarChart3, label: 'Analytics' },
  ];

  // Add "My Team" link if user is in a team
  const myTeamLink = participant?.teamId ? {
    to: `/teams/${participant.teamId}`,
    icon: Users,
    label: 'My Team',
    highlight: true
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  TeamSync
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-1">
              {myTeamLink && (
                <Link
                  to={myTeamLink.to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transition-all shadow-md"
                >
                  <myTeamLink.icon className="w-5 h-5" />
                  <span className="font-medium">{myTeamLink.label}</span>
                </Link>
              )}
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {participant?.name || 'Profile'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around">
          {myTeamLink && (
            <Link
              to={myTeamLink.to}
              className="flex flex-col items-center py-3 px-4 text-primary-600 font-semibold"
            >
              <myTeamLink.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{myTeamLink.label}</span>
            </Link>
          )}
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center py-3 px-4 text-gray-600 hover:text-primary-600"
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
