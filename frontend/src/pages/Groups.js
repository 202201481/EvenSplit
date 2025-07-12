import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { groupsAPI, friendsAPI } from '../services/api';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    members_ids: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, friendsRes] = await Promise.all([
        groupsAPI.list(),
        friendsAPI.list(),
      ]);
      setGroups(groupsRes.data);
      setFriends(friendsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const groupData = {
        ...formData,
        members_ids: formData.members_ids.map(id => parseInt(id)),
      };
      
      await groupsAPI.create(groupData);
      setShowCreateForm(false);
      setFormData({ name: '', members_ids: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMembersChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      members_ids: value,
    });
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Groups</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            {showCreateForm ? 'Cancel' : 'Create Group'}
          </button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Create New Group</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Roommates, Trip to Europe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Members
                </label>
                <select
                  multiple
                  name="members_ids"
                  value={formData.members_ids}
                  onChange={handleMembersChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                >
                  {friends.map((friend) => (
                    <option key={friend.friend_info.id} value={friend.friend_info.id}>
                      {friend.friend_info.username}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-dark-400 mt-1">Hold Ctrl/Cmd to select multiple friends</p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
              >
                Create Group
              </button>
            </form>
          </div>
        )}

        {/* Groups List */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-medium text-white mb-2">No groups yet</h3>
              <p className="text-dark-400 mb-6">
                Create groups to organize your friends and make splitting bills easier!
              </p>
              {friends.length === 0 && (
                <p className="text-dark-500 text-sm">
                  You need to add friends first before creating groups.{' '}
                  <button
                    onClick={() => window.location.href = '/friends'}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Add friends →
                  </button>
                </p>
              )}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{group.name}</h3>
                    <p className="text-dark-400 text-sm">
                      Created by {group.created_by.username} on{' '}
                      {new Date(group.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-dark-300 mb-2">Members:</p>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map((member) => (
                          <span
                            key={member.id}
                            className="px-3 py-1 bg-dark-700 text-white text-sm rounded-full"
                          >
                            {member.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-white">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => window.location.href = `/bills?group=${group.id}`}
                      className="mt-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Create Bill
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        {groups.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Group Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-400">{groups.length}</p>
                <p className="text-dark-300 text-sm">Total Groups</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {groups.reduce((total, group) => total + group.members.length, 0)}
                </p>
                <p className="text-dark-300 text-sm">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(groups.reduce((total, group) => total + group.members.length, 0) / groups.length)}
                </p>
                <p className="text-dark-300 text-sm">Avg Members/Group</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Groups;
