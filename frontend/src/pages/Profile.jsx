import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Save, Loader2, Linkedin, Github, Globe, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Profile = () => {
  const { participant, updateParticipant } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ bio: false, skills: false });
  const [formData, setFormData] = useState({
    name: '',
    rolePreference: 'Open to Any',
    technicalSkills: [],
    interests: [],
    softSkills: [],
    experienceLevel: 'Intermediate',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (participant && !isInitialized) {
      setFormData({
        name: participant.name || '',
        rolePreference: participant.rolePreference || 'Open to Any',
        technicalSkills: participant.technicalSkills || [],
        interests: participant.interests || [],
        softSkills: participant.softSkills || [],
        experienceLevel: participant.experienceLevel || 'Intermediate',
        bio: participant.bio || '',
        linkedinUrl: participant.linkedinUrl || '',
        githubUrl: participant.githubUrl || '',
        portfolioUrl: participant.portfolioUrl || '',
      });
      setIsInitialized(true);
    }
  }, [participant, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/participants/profile', formData);
      updateParticipant(response.data.participant);
      toast.success('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.technicalSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        technicalSkills: [...formData.technicalSkills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      technicalSkills: formData.technicalSkills.filter((s) => s !== skill),
    });
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()],
      });
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const toggleSoftSkill = (skill) => {
    if (formData.softSkills.includes(skill)) {
      setFormData({
        ...formData,
        softSkills: formData.softSkills.filter((s) => s !== skill),
      });
    } else {
      setFormData({
        ...formData,
        softSkills: [...formData.softSkills, skill],
      });
    }
  };

  const improveBioWithAI = async () => {
    console.log('Starting bio enhancement...');
    console.log('Current bio:', formData.bio);
    console.log('Current skills:', formData.technicalSkills);
    console.log('Current role:', formData.rolePreference);
    
    setAiLoading(prev => ({ ...prev, bio: true }));
    try {
      const response = await api.post('/ai/improve-bio', {
        bio: formData.bio,
        skills: formData.technicalSkills,
        role: formData.rolePreference,
      });
      
      console.log('API Response:', response.data);
      console.log('Received improved bio:', response.data.improvedBio);
      
      if (response.data.improvedBio) {
        const newBio = response.data.improvedBio;
        console.log('Setting new bio:', newBio);
        
        setFormData(prev => {
          console.log('Previous formData:', prev);
          const updated = { ...prev, bio: newBio };
          console.log('Updated formData:', updated);
          return updated;
        });
        
        toast.success('✨ AI-enhanced bio generated!');
      } else {
        toast.error('Could not generate bio');
      }
    } catch (error) {
      console.error('Bio enhancement error:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to improve bio with AI');
    } finally {
      setAiLoading(prev => ({ ...prev, bio: false }));
    }
  };

  const suggestSkillsWithAI = async () => {
    setAiLoading(prev => ({ ...prev, skills: true }));
    try {
      const response = await api.post('/ai/suggest-skills', {
        role: formData.rolePreference,
        currentSkills: formData.technicalSkills,
      });
      const suggestions = response.data.suggestions;
      
      // Add unique suggestions to skills
      const newSkills = [...new Set([...formData.technicalSkills, ...suggestions])];
      setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
      toast.success(`✨ Added ${suggestions.length} AI-suggested skills!`);
    } catch (error) {
      toast.error('Failed to get skill suggestions');
    } finally {
      setAiLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const softSkillOptions = [
    'Pitching',
    'Documentation',
    'Leadership',
    'UI/UX Thinking',
    'Team Coordination',
    'Research',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-gray-600">Complete your profile to start discovering teams</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Role Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role Preference <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.rolePreference}
            onChange={(e) => setFormData({ ...formData, rolePreference: e.target.value })}
            className="input"
          >
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="ML/AI">ML/AI Engineer</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Open to Any">Open to Any</option>
          </select>
        </div>

        {/* Technical Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technical Skills <span className="text-red-500">*</span>
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
            <button
              type="button"
              onClick={addSkill}
              className="btn-primary"
            >
              Add
            </button>
            <button
              type="button"
              onClick={suggestSkillsWithAI}
              disabled={aiLoading.skills}
              className="btn-secondary flex items-center space-x-2"
              title="Get AI-powered skill suggestions"
            >
              {aiLoading.skills ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>AI Suggest</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technicalSkills.map((skill, index) => (
              <span
                key={index}
                className="badge-primary flex items-center space-x-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-primary-600 hover:text-primary-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests / Domains
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="input flex-1"
              placeholder="e.g., Healthcare, FinTech, Gaming"
            />
            <button
              type="button"
              onClick={addInterest}
              className="btn-primary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="badge-success flex items-center space-x-2"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="text-green-700 hover:text-green-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soft Skills
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {softSkillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSoftSkill(skill)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  formData.softSkills.includes(skill)
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-primary-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            className="input"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio (Optional)
          </label>
          <div className="relative">
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="input"
              rows={4}
              maxLength={500}
              placeholder="Tell us about yourself, your hackathon experience, what you're passionate about..."
            />
            <button
              type="button"
              onClick={improveBioWithAI}
              disabled={aiLoading.bio}
              className="absolute top-2 right-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              title="Enhance your bio with AI"
            >
              {aiLoading.bio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Enhance with AI</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span>LinkedIn Profile (Optional)</span>
          </label>
          <input
            type="text"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            className="input"
            placeholder="linkedin.com/in/yourprofile or https://linkedin.com/in/yourprofile"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Github className="w-4 h-4 text-gray-800" />
            <span>GitHub Profile (Optional)</span>
          </label>
          <input
            type="text"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="input"
            placeholder="github.com/yourusername or https://github.com/yourusername"
          />
        </div>

        {/* Portfolio URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-600" />
            <span>Portfolio Website (Optional)</span>
          </label>
          <input
            type="text"
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            className="input"
            placeholder="yourportfolio.com or https://yourportfolio.com"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Profile;
