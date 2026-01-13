import { Link } from 'react-router-dom';
import { Users, Sparkles, Shield, Zap, Heart, BarChart3, MousePointer, FileText, Clock } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Skill-Gap Analysis',
      description: 'Visual indicators show skill compatibility in real-time',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Team Balance Score',
      description: 'Transparent 0-100 scoring for perfect team composition',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Soft-Skill Matching',
      description: 'Find pitchers, documenters, and coordinators',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: MousePointer,
      title: 'Swipe Discovery',
      description: 'Mobile-first Tinder-like interface for quick matching',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Smart Visibility Boost',
      description: 'Solo participants get automatic priority',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: FileText,
      title: 'Auto Team Cards',
      description: 'Generate shareable team summaries instantly',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'OTP-based auth with no JWT in browser',
      color: 'from-gray-700 to-gray-900',
    },
    {
      icon: Clock,
      title: 'Lifecycle Management',
      description: 'Auto-lock profiles and archive data post-event',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-6 animate-fade-in">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent animate-slide-up">
            TeamSync
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            Smart Team Discovery for Hackathons
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-slide-up">
            Find your perfect hackathon teammates through intelligent matching, skill-gap analysis, 
            and transparent team balance scoring. No AI black boxes, just smart logic.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              to="/login"
              className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Get Started →
            </Link>
            <a
              href="#features"
              className="btn-secondary px-8 py-4 text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { value: '9+', label: 'Unique Features' },
            { value: '100%', label: 'MERN Stack' },
            { value: '0', label: 'Black-Box AI' },
          ].map((stat, index) => (
            <div key={index} className="card text-center animate-fade-in">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div id="features" className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            9 Powerful Features
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to build the perfect hackathon team, explained transparently
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:scale-105 transform transition-all duration-300 cursor-pointer"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign In', desc: 'Use email + OTP (no passwords!)' },
              { step: '2', title: 'Create Profile', desc: 'Add skills, interests & preferences' },
              { step: '3', title: 'Discover Teams', desc: 'Browse with smart filters & matching' },
              { step: '4', title: 'Form Team', desc: 'Send invites & build your dream team' },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Team?</h2>
          <p className="text-lg mb-8 text-primary-50">
            Join TeamSync and discover the perfect teammates for your next hackathon
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Now →
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2026 TeamSync - Built with ❤️ for better hackathon collaboration</p>
          <p className="mt-2">MERN Stack • Tailwind CSS • No AI Black Boxes</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
