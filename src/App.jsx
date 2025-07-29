/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

function App() {
  const [influencers, setInfluencers] = useState([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showInput, setShowInput] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // New state for lock/unlock

  // Modern color theme
  const COLORS = {
    primary: '#0F172A',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    highlight: '#10B981',
    light: '#F8FAFC',
    background: '#FFFFFF'
  };

  // Fetch all influencers on component mount
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://vis-inf-backend.vercel.app/api/influencers');
        const data = await response.json();
        setInfluencers(data);
      } catch {
        setError('Failed to fetch influencers');
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  // Fetch influencer details when selected
  const fetchInfluencerDetails = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      // Use ONLY this endpoint format
      const response = await fetch(`https://vis-inf-backend.vercel.app/api/influencers?id=${id}`, {
        mode: 'cors', // explicitly request CORS
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedInfluencer(data);
      
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewInfluencer = () => {
    setShowInput(true);
    setSelectedInfluencer(null);
    setActiveTab('overview');
  };

  // Safe data access helpers
  const safeGet = (obj, path, defaultValue = null) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  };

  const formatNumber = (num) => {
    if (typeof num === 'number') {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toLocaleString();
    }
    return num || 'N/A';
  };

  const formatScore = (score) => {
    if (typeof score === 'number') {
      return score.toFixed(1);
    }
    return 'N/A';
  };

  const getScoreColor = (score) => {
    if (typeof score !== 'number') return 'gray';
    if (score >= 7) return 'green';
    if (score >= 5) return 'blue';
    if (score >= 3) return 'yellow';
    return 'red';
  };

  const getScoreCategory = (score) => {
    if (typeof score !== 'number') return 'Unknown';
    if (score >= 7) return 'Excellent';
    if (score >= 5) return 'Good';
    if (score >= 3) return 'Fair';
    return 'Poor';
  };

  const getRiskColor = (riskLevel) => {
    switch ((riskLevel || '').toLowerCase()) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  // Lock/Unlock Toggle Component
  const LockToggle = () => (
    <button
      onClick={() => setIsLocked(!isLocked)}
      className={`flex items-center px-4 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
        isLocked 
          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700' 
          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
      }`}
    >
      {isLocked ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Locked
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Unlocked
        </>
      )}
    </button>
  );

  // Locked Content Overlay Component - Fixed to prevent overflow
  const LockedOverlay = ({ children, title = "Premium Content" }) => (
    <div className="relative w-full h-full">
      <div className={`${isLocked ? 'filter blur-sm pointer-events-none' : ''} transition-all duration-300 w-full h-full`}>
        {children}
      </div>
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl flex items-center justify-center">
          <div className="text-center p-4 bg-slate-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 w-[80%] max-w-[300px]">
            <div className="w-8 h-8 mx-auto mb-2 bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">{title}</h3>
            <p className="text-slate-300 mb-3 text-[10px]">Upgrade to premium to access this detailed analysis</p>
            <button 
              onClick={() => setIsLocked(false)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded-lg font-bold text-[10px] shadow"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Icons for the stat cards
  const PeopleIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );

  const TierIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 010 2h3a1 1 0 01.894.553l2 4A1 1 0 0118 9H5.618l-.894-4H3a1 1 0 010-2h2.382l.894 4h11.236l-1.447-2.894A1 1 0 0116 6h-3a1 1 0 010-2z" clipRule="evenodd" />
    </svg>
  );

  const EngagementIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );

  const CredibilityIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  const PostsIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );

  // Refined StatCard component
  const StatCard = ({ title, value, icon, color = "primary", alert = false }) => {
    const IconComponent = icon;
    const colorClasses = {
      primary: 'bg-slate-900 border-slate-800',
      secondary: 'bg-blue-600 border-blue-500',
      accent: 'bg-amber-500 border-amber-400',
      highlight: 'bg-emerald-600 border-emerald-500',
      green: 'bg-emerald-600 border-emerald-500',
      red: 'bg-red-600 border-red-500',

      navy: 'bg-[#0D1B3E] border-[#0D1B3E] text-white',
      blue: 'bg-[#2A7DFF] border-[#2A7DFF] text-white',
      pink: 'bg-[#FF5A9E] border-[#FF5A9E] text-white',
      yellow: 'bg-[#F49A1A] border-[#F49A1A] text-white',
      teal: 'bg-[#007D8A] border-[#007D8A] text-white', // replaces lightBlue
      gray: 'bg-[#F7F7F7] border-[#F7F7F7] text-black', // also light
    };

    return (
      <div className={`${colorClasses[color]} rounded-2xl p-4 sm:p-6 text-white shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${alert ? 'ring-2 ring-red-400 ring-opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs sm:text-sm font-medium mb-1 truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold truncate">{value}</p>
          </div>
          <div className="bg-white/20 p-2 sm:p-3 rounded-xl backdrop-blur-sm flex-shrink-0 ml-2">
            <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
            {alert && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Refined CollapsibleSection
  const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div
          className="flex justify-between items-center cursor-pointer p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            {title}
          </h2>
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
          {isOpen && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
              <div className="pt-4 sm:pt-6">{children}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfileSummary = useMemo(() => {
    return (data) => {
      if (!data) return null;

      return (
        <div className="space-y-8">
          <CollapsibleSection title={
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Profile Overview
            </div>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
  <StatCard
    title="Followers"
    value={formatNumber(safeGet(data, 'ai_analysis.profile_analysis.profile_summary.follower_count', 'N/A'))}
    icon={PeopleIcon}
    color="navy"
  />
  <StatCard
    title="Account Tier"
    value={safeGet(data, 'account_tier', 'N/A')}
    icon={TierIcon}
    color="pink"
  />
  <StatCard
    title="Engagement Rate"
    value={safeGet(data, 'robust_tier_adjusted_engagement_rate', 'N/A') + '%'}
    icon={EngagementIcon}
    color="yellow"
  />
  <StatCard
    title="Credibility Score"
    value={safeGet(data, 'credibility_score.value', 'N/A') + '/10'}
    icon={CredibilityIcon}
    color="blue"
  />
  <StatCard
    title="Total Posts"
    value={safeGet(data, 'total_posts_analyzed', 'N/A')}
    icon={PostsIcon}
    color="teal"
  />
</div>


            {/* Value Proposition */}
            {safeGet(data, 'ai_analysis.executive_summary.value_proposition') && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-emerald-100 mb-6">
                <h3 className="text-base sm:text-lg font-bold text-emerald-900 mb-3">Value Proposition</h3>
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                  {data.ai_analysis.executive_summary.value_proposition}
                </p>
              </div>
            )}

            {/* Performance Notes */}
            {safeGet(data, 'ai_analysis.executive_summary.performance_notes') && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100 mb-6">
                <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-4">Performance Notes</h3>
                <div className="space-y-4">
                  {safeGet(data.ai_analysis.executive_summary.performance_notes, 'content_themes') && (
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                        <span className="font-semibold">Content Themes:</span> {data.ai_analysis.executive_summary.performance_notes.content_themes}
                      </p>
                    </div>
                  )}
                  {safeGet(data.ai_analysis.executive_summary.performance_notes, 'overall_recommendation') && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                        <span className="font-semibold">Recommendation:</span> {data.ai_analysis.executive_summary.performance_notes.overall_recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Advisory - Locked */}
            {safeGet(data, 'ai_analysis.executive_summary.risk_advisory') && (
              <LockedOverlay title="Risk Advisory">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-red-100">
                  <h3 className="text-base sm:text-lg font-bold text-red-900 mb-3">Risk Advisory</h3>
                  <p className="text-red-800 leading-relaxed text-sm sm:text-base">
                    {data.ai_analysis.executive_summary.risk_advisory}
                  </p>
                </div>
              </LockedOverlay>
            )}
          </CollapsibleSection>
        </div>
      );
    }
  }, [isLocked]);

  // Remove Engagement tab from the navigation
  const renderTabs = useMemo(() => {
    return () => (
      <div className="bg-white rounded-2xl p-2 mb-8 shadow-sm border border-gray-100">
        <div className="flex overflow-x-auto scrollbar-hide space-x-2">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'content', label: 'Content', icon: '📝' },
            { key: 'safety', label: 'Brand Safety', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 sm:px-6 py-3 font-medium rounded-xl whitespace-nowrap transition-all duration-200 text-sm sm:text-base ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [activeTab]);

  // Update Content Analysis section
  const renderContentAnalysis = useMemo(() => {
    return (data) => {
      if (!data) return null;

      return (
        <CollapsibleSection title={
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            Content Analysis
          </div>
        }>
          <div className="space-y-8">
            {/* Primary Categories */}
            {safeGet(data, 'ai_analysis.profile_analysis.content_analysis.primary_categories') && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Primary Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.ai_analysis.profile_analysis.content_analysis.primary_categories.map((category, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-sm transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-base sm:text-lg mb-2">{category.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {category.rule || 'Primary content category'}
                          </div>
                        </div>
                        <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 ml-2">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Analysis - Partially Locked */}
            {safeGet(data, 'ai_analysis.profile_analysis.content_analysis.geo_analysis') && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Geographic Analysis</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-emerald-100">
                  {/* Location Diversity at the top - Always visible */}
                  {safeGet(data, 'ai_analysis.profile_analysis.content_analysis.geo_analysis.location_diversity') && (
                    <div className="bg-emerald-100/50 rounded-xl p-4 border border-emerald-200 mb-6">
                      <div className="font-bold text-emerald-900 mb-1 text-sm sm:text-base">Location Diversity Assessment</div>
                      <div className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                        {data.ai_analysis.profile_analysis.content_analysis.geo_analysis.location_diversity}
                      </div>
                    </div>
                  )}
                  
                  {/* Locations Grid - Locked */}
                  <LockedOverlay title="Geographic Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {safeGet(data, 'ai_analysis.profile_analysis.content_analysis.geo_analysis.locations', []).map((location, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 border border-emerald-100">
                          <div className="font-bold text-emerald-900 mb-1 text-sm sm:text-base">{location.name}</div>
                          <div className="text-xs sm:text-sm text-emerald-700 leading-relaxed">{location.rule}</div>
                        </div>
                      ))}
                    </div>
                  </LockedOverlay>
                </div>
              </div>
            )}

            {/* Hashtag Analysis - Locked */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Hashtag Analysis</h3>
              <LockedOverlay title="Hashtag Insights">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Top Hashtag</div>
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">
                        {safeGet(data, 'top_hashtag_percentage', 'N/A')}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">of total usage</div>
                    </div>
                  </div>

                  {/* Top Hashtags */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(safeGet(data, 'hashtag_frequency', {}))
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([hashtag, count]) => (
                        <span key={hashtag} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer">
                          #{hashtag} ({count})
                        </span>
                      ))}
                  </div>
                </div>
              </LockedOverlay>
            </div>
          </div>
        </CollapsibleSection>
      );
    }
  }, [isLocked]);

  // Update Brand Safety section - Fully Locked
  const renderBrandSafety = useMemo(() => {
    return (data) => {
      if (!data) return null;

      return (
        <LockedOverlay title="Brand Safety Analysis">
          <div className="space-y-8">
            <CollapsibleSection title={
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Brand Safety Overview
              </div>
            }>
              <div className="space-y-8">
                {/* Risk Assessment */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Risk Assessment</h3>
                  <div className={`bg-gradient-to-br ${getRiskColor(safeGet(data, 'risk_level')) === 'green' ? 'from-emerald-50 to-green-50 border-emerald-200' : getRiskColor(safeGet(data, 'risk_level')) === 'yellow' ? 'from-yellow-50 to-amber-50 border-yellow-200' : 'from-red-50 to-pink-50 border-red-200'} rounded-2xl p-4 sm:p-6 border`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
                      <div className="flex items-center">
                        <div className="font-bold text-gray-900 mr-4 text-sm sm:text-base">Risk Level:</div>
                        <div className={`px-3 py-2 rounded-full text-xs sm:text-sm font-bold ${getRiskColor(safeGet(data, 'risk_level')) === 'green' ? 'bg-emerald-100 text-emerald-800' : getRiskColor(safeGet(data, 'risk_level')) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {safeGet(data, 'risk_level', 'Unknown')}
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        Score: {safeGet(data, 'risk_score', 'N/A')}/100
                      </div>
                    </div>
                    {safeGet(data, 'ai_analysis.profile_analysis.brand_safety.risk_level.explanation') && (
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{data.ai_analysis.profile_analysis.brand_safety.risk_level.explanation}</p>
                    )}
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Risk Factors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(safeGet(data, 'risk_factors', {})).map(([factor, value]) => (
                      <div key={factor} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:shadow-sm transition-all duration-200">
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-gray-900 capitalize text-sm sm:text-base">
                            {factor.replace(/_/g, ' ')}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                            value ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {value ? '✓' : '✗'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Posting Consistency moved to Brand Safety */}
            <CollapsibleSection title={
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                Posting Consistency
              </div>
            }>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 sm:p-6 border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Average Days Between Posts</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {safeGet(data, 'average_days_between_posts', 0)} days
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Consistency Score</div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                      {parseFloat(safeGet(data, 'posting_consistency_score', 0)).toFixed(1)}/100
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Credibility Score */}
            <CollapsibleSection title={
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Credibility Analysis
              </div>
            }>
              {(() => {
                const credibilityScore = safeGet(data, 'credibility_score.value');
                const scoreColor = getScoreColor(credibilityScore);
                const gradientMap = {
                  green: 'from-emerald-500 to-green-600',
                  blue: 'from-blue-500 to-indigo-600',
                  yellow: 'from-yellow-500 to-amber-600',
                  red: 'from-red-500 to-pink-600',
                  gray: 'from-gray-500 to-slate-600'
                };
                const gradientClass = gradientMap[scoreColor] || gradientMap.gray;

                return (
                  <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-6 sm:p-8 text-white shadow-lg`}>
                    <div className="flex items-center justify-center mb-6 sm:mb-8">
                      <div className="text-center">
                        <div className="text-4xl sm:text-6xl font-black mb-2">{formatScore(credibilityScore)}</div>
                        <div className="text-lg sm:text-xl font-bold">Credibility Score</div>
                        <div className="mt-4 text-white/80 font-medium text-sm sm:text-base">
                          {getScoreCategory(credibilityScore)} · Out of 10
                        </div>
                      </div>
                    </div>

                    {safeGet(data, 'credibility_score.components') && (
                      <div className="mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-white/90 mb-4">Score Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(data.credibility_score.components).map(([key, value]) => (
                            <div key={key} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                              <div className="flex justify-between items-center">
                                <div className="capitalize text-xs sm:text-sm font-medium">{key.replace(/_/g, ' ')}</div>
                                <div className="font-bold text-base sm:text-lg">{typeof value === 'number' ? value.toFixed(2) : value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {safeGet(data, 'credibility_score.analysis') && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{data.credibility_score.analysis}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CollapsibleSection>
          </div>
        </LockedOverlay>
      );
    }
  }, [isLocked]);

  const renderInfluencerList = () => (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 mb-8 border border-gray-100">
      <div className="text-center mb-8 sm:mb-10">
        <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4 sm:mb-6">
          <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Select an Influencer</h3>
        <p className="text-gray-600 text-base sm:text-lg">Choose from our database of analyzed influencers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {influencers.map((influencer) => (
            <div
              key={influencer.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => fetchInfluencerDetails(influencer.id)}
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-lg rounded-2xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0">
                  {influencer.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-indigo-600 transition-colors truncate">@{influencer.username}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">ID: {influencer.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 sm:p-3 rounded-2xl shadow-lg mr-3 sm:mr-4 flex-shrink-0">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                  Influencer Analytics Dashboard
                </h1>
                <p className="text-gray-300 mt-1 text-xs sm:text-sm">Comprehensive analysis of influencer profiles and performance metrics</p>
              </div>
            </div>
            {selectedInfluencer && (
              <button
                onClick={handleAddNewInfluencer}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Influencer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        {/* Show influencer list or dashboard */}
        {showInput || !selectedInfluencer ? (
          renderInfluencerList()
        ) : (
          <div>
            {/* Profile Section - Always Visible with Lock Toggle */}
<div className="text-center mb-10">
  <div className="relative inline-block mb-5">
    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl sm:text-4xl font-extrabold shadow-xl border-4 border-white mx-auto">
      {safeGet(selectedInfluencer, 'username', 'U')?.charAt(0).toUpperCase()}
    </div>
    {safeGet(selectedInfluencer, 'ai_analysis.profile_analysis.profile_summary.is_verified') && (
      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-4 border-white shadow-md">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )}
  </div>

  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 tracking-wide">
    @{safeGet(selectedInfluencer, 'username', 'unknown')}
  </h2>

  {/* Minimal Location & Category Headings */}
  <div className="flex justify-center gap-8 sm:gap-12 mb-6">
    {/* Top Locations */}
    <div className="text-center px-3 py-2 bg-purple-50 rounded-xl shadow-sm">
      <h3 className="text-[10px] uppercase tracking-widest text-purple-700 font-semibold mb-1">Top Locations</h3>
      <p className="text-sm font-medium text-purple-900">
        {safeGet(selectedInfluencer, 'ai_analysis.profile_analysis.content_analysis.geo_analysis.locations', [])
          .slice(0, 2)
          .map(loc => loc.name.split(',')[0])
          .join(', ')}
      </p>
    </div>

    {/* Top Categories */}
    <div className="text-center px-3 py-2 bg-pink-50 rounded-xl shadow-sm">
      <h3 className="text-[10px] uppercase tracking-widest text-pink-700 font-semibold mb-1">Top Categories</h3>
      <p className="text-sm font-medium text-pink-900">
        {safeGet(selectedInfluencer, 'ai_analysis.profile_analysis.content_analysis.primary_categories', [])
          .slice(0, 3)
          .map(cat => cat.name)
          .join(', ')}
      </p>
    </div>
  </div>

  {/* Lock/Unlock Toggle Button */}
  <div className="flex justify-center mt-2">
    <LockToggle />
  </div>
</div>


            {/* Tabs */}
            {renderTabs()}

            {/* Tab Content */}
            {activeTab === 'overview' && (
              renderProfileSummary(selectedInfluencer)
            )}

            {activeTab === 'content' && (
              renderContentAnalysis(selectedInfluencer)
            )}

            {activeTab === 'safety' && (
              renderBrandSafety(selectedInfluencer)
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-800 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg mr-3 flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-base sm:text-lg font-black text-white">Influencer Analytics</span>
            </div>
            <div className="flex space-x-4 sm:space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300 font-medium transition-colors text-sm sm:text-base">Documentation</a>
              <a href="#" className="text-gray-400 hover:text-gray-300 font-medium transition-colors text-sm sm:text-base">API</a>
              <a href="#" className="text-gray-400 hover:text-gray-300 font-medium transition-colors text-sm sm:text-base">Support</a>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800 text-center text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} Influencer Analytics Dashboard. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;