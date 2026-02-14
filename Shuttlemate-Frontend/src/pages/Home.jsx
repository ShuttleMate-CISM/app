import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Video, Users, MapPin, ShoppingBag, Clock, Settings, Bell, Search, Filter, Download, Eye, UserCheck, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  const [apiData, setApiData] = useState({
    totalUsers: 0,
    totalCoaches: 0,
    totalCourts: 0,
    totalVideos: 0,
    totalShops: 0,
    totalMatches: 0,
    totalItems: 0,
    loading: true,
    error: null
  });

 useEffect(() => {
  const fetchAllData = async () => {
    try {
      setApiData(prev => ({ ...prev, loading: true, error: null }));

      const endpoints = {
        users: 'http://localhost:5001/api/user',
        coaches: 'http://localhost:5001/api/Coachers', 
        courts: 'http://localhost:5001/api/courts',
        videos: 'http://localhost:5001/api/videos',
        shops: 'http://localhost:5001/api/shops',
        matches: 'http://localhost:5001/api/matches',
        items: 'http://localhost:5001/api/items'
      };

      // Function to extract count from different response formats
      const getCount = (data, key) => {
        // If data is directly an array
        if (Array.isArray(data)) {
          return data.length;
        }
        
        // If data has explicit count/total properties
        if (data.count !== undefined) return data.count;
        if (data.total !== undefined) return data.total;
        
        // Handle specific API response formats
        switch(key) {
          case 'coaches':
            return Array.isArray(data.coachers) ? data.coachers.length : 0;
          case 'users':
            return Array.isArray(data.users) ? data.users.length : 0;
          case 'courts':
            return Array.isArray(data.courts) ? data.courts.length : 0;
          case 'videos':
            return Array.isArray(data.videos) ? data.videos.length : 0;
          case 'shops':
            return Array.isArray(data.shops) ? data.shops.length : 0;
          case 'matches':
            return Array.isArray(data.matches) ? data.matches.length : 0;
          default:
            return 0;
        }
      };

      // Fetch all data concurrently
      const promises = Object.entries(endpoints).map(async ([key, endpoint]) => {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${key}: ${response.statusText}`);
          }
          const data = await response.json();
          
          return { 
            key, 
            count: getCount(data, key)
          };
        } catch (error) {
          console.error(`Error fetching ${key}:`, error);
          return { key, count: 0 };
        }
      });

      const results = await Promise.all(promises);
      
      // Update state with fetched data
      const newData = { loading: false, error: null };
      results.forEach(({ key, count }) => {
        switch(key) {
          case 'users':
            newData.totalUsers = count;
            break;
          case 'coaches':
            newData.totalCoaches = count;
            break;
          case 'courts':
            newData.totalCourts = count;
            break;
          case 'videos':
            newData.totalVideos = count;
            break;
          case 'shops':
            newData.totalShops = count;
            break;
          case 'matches':
            newData.totalMatches = count;
            break;
          case 'items':
            newData.totalItems = count;
            break;
        }
      });

      setApiData(prev => ({ ...prev, ...newData }));

    } catch (error) {
      console.error('Error fetching data:', error);
      setApiData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load data. Please try again.' 
      }));
    }
  };

  fetchAllData();
}, []);

  const adminCards = [
    {
      id: 1,
      title: 'Total Users',
      value: apiData.loading ? 'Loading...' : apiData.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      trend: 'up',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      title: 'Video Uploads',
      value: apiData.loading ? 'Loading...' : apiData.totalVideos.toLocaleString(),
      change: '+8.3%',
      icon: Video,
      trend: 'up',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 3,
      title: 'Active Coaches',
      value: apiData.loading ? 'Loading...' : apiData.totalCoaches.toLocaleString(),
      change: '+15.4%',
      icon: UserCheck,
      trend: 'up',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 4,
      title: 'Available Courts',
      value: apiData.loading ? 'Loading...' : apiData.totalCourts.toLocaleString(),
      change: '+6.7%',
      icon: MapPin,
      trend: 'up',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      id: 5,
      title: 'Total Matches',
      value: apiData.loading ? 'Loading...' : apiData.totalMatches.toLocaleString(),
      change: '+11.2%',
      icon: Activity,
      trend: 'up',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'uploaded a video', time: '2 min ago', type: 'video' },
    { id: 2, user: 'Sarah Wilson', action: 'booked Coach Mike', time: '5 min ago', type: 'booking' },
    { id: 3, user: 'Alex Chen', action: 'reserved Court A', time: '8 min ago', type: 'court' },
    { id: 4, user: 'Emma Davis', action: 'purchased equipment', time: '12 min ago', type: 'shop' },
    { id: 5, user: 'Michael Brown', action: 'completed session', time: '15 min ago', type: 'session' }
  ];

  // Show error state if needed
  if (apiData.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{apiData.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
       <Navbar />

      <div className="p-6 mt-20">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Platform Overview</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {apiData.loading ? 'Loading...' : 'All Systems Operational'}
            </span>
          </div>
         
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div key={card.id} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {card.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                  <p className="text-sm font-medium text-gray-900">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-indigo-50">
                <ShoppingBag className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.2%
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {apiData.loading ? 'Loading...' : apiData.totalShops.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-gray-900">Total Shops</p>
              <p className="text-xs text-gray-500 mt-1">Active shop listings</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-pink-50">
                <Settings className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.1%
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {apiData.loading ? 'Loading...' : apiData.totalItems.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-gray-900">Total Items</p>
              <p className="text-xs text-gray-500 mt-1">Equipment & accessories</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-50">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <span>Live Data</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {apiData.loading ? 'Loading...' : new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-xs text-gray-500 mt-1">Real-time sync</p>
            </div>
          </div>
        </div>


        
      </div>
    </div>
  );
};

export default Home;