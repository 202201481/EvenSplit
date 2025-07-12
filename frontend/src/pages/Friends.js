import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { friendsAPI, authAPI } from '../services/api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendsAPI.list();
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await authAPI.searchUsers(searchQuery);
      // Filter out users who are already friends
      const existingFriendIds = friends.map(f => f.friend_info.id);
      const filteredResults = response.data.filter(user => 
        !existingFriendIds.includes(user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await friendsAPI.add(userId);
      // Remove from search results and refresh friends list
      setSearchResults(searchResults.filter(user => user.id !== userId));
      fetchFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Friends</h1>

        {/* Search Form */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">Add New Friend</h3>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or email..."
              className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-dark-300 mb-3">Search Results:</h4>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-3 bg-dark-700 rounded-md">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-dark-400 text-sm">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <div className="mt-4 text-center text-dark-400">
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">Your Friends</h3>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <h4 className="text-xl font-medium text-white mb-2">No friends yet</h4>
              <p className="text-dark-400">Search for users above to add your first friend!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friendship) => (
                <div key={friendship.id} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {friendship.friend_info.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{friendship.friend_info.username}</p>
                      <p className="text-dark-400 text-sm">{friendship.friend_info.email}</p>
                      <p className="text-dark-500 text-xs">
                        Friends since {new Date(friendship.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {friends.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = '/bills'}
                className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-lg text-left"
              >
                <div className="text-lg font-medium">💰 Create Bill</div>
                <div className="text-sm text-primary-200">Split expenses with your friends</div>
              </button>
              <button
                onClick={() => window.location.href = '/groups'}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left"
              >
                <div className="text-lg font-medium">👨‍👩‍👧‍👦 Create Group</div>
                <div className="text-sm text-green-200">Organize friends into groups</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Friends;
