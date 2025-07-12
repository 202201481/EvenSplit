import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { billsAPI, friendsAPI, groupsAPI } from '../services/api';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    desc: '',
    amount: '',
    participants: [],
    split_type: 'equal',
    category: 'other',
    group: '',
    is_recurring: false,
    recurrence_type: 'none',
    next_due_date: '',
  });
  const [splits, setSplits] = useState({}); // For custom splits

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, friendsRes, groupsRes] = await Promise.all([
        billsAPI.list(),
        friendsAPI.list(),
        groupsAPI.list(),
      ]);
      setBills(billsRes.data);
      setFriends(friendsRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.desc.trim()) {
        alert('Description is required');
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        alert('Valid amount is required');
        return;
      }
      if (formData.participants.length === 0) {
        alert('At least one participant is required');
        return;
      }

      // Validate splits for non-equal splits
      if (formData.split_type !== 'equal' && !validateSplits()) {
        if (formData.split_type === 'percentage') {
          alert('Percentages must add up to 100%');
        } else {
          alert('Split amounts must add up to the total bill amount');
        }
        return;
      }

      const billData = {
        desc: formData.desc.trim(),
        amount: parseFloat(formData.amount),
        participants: formData.participants.map(id => parseInt(id)),
        split_type: formData.split_type,
        category: formData.category,
        group: formData.group ? parseInt(formData.group) : null,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.recurrence_type || 'none',
        next_due_date: formData.next_due_date || null,
      };

      // Add custom splits data if not equal split
      if (formData.split_type !== 'equal') {
        billData.splits = getSelectedParticipants().map(participant => ({
          user_id: participant.friend.id,
          amount: formData.split_type === 'percentage' 
            ? (parseFloat(splits[participant.friend.id]) / 100) * parseFloat(formData.amount)
            : parseFloat(splits[participant.friend.id])
        }));
      }
      
      await billsAPI.create(billData);
      setShowCreateForm(false);
      setFormData({
        desc: '',
        amount: '',
        participants: [],
        split_type: 'equal',
        category: 'other',
        group: '',
        is_recurring: false,
        recurrence_type: 'none',
        next_due_date: '',
      });
      setSplits({});
      fetchData();
    } catch (error) {
      console.error('Error creating bill:', error);
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
        alert(`Error creating bill: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Error creating bill. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleParticipantsChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      participants: value,
    });
    // Reset splits when participants change
    setSplits({});
  };

  const handleSplitChange = (participantId, value) => {
    setSplits({
      ...splits,
      [participantId]: value,
    });
  };

  const getSelectedParticipants = () => {
    return friends.filter(friend => formData.participants.includes(friend.friend_info.id.toString()));
  };

  const validateSplits = () => {
    if (formData.split_type === 'equal') return true;
    
    const selectedParticipants = getSelectedParticipants();
    const totalAmount = parseFloat(formData.amount);
    
    if (formData.split_type === 'percentage') {
      const totalPercentage = selectedParticipants.reduce((sum, participant) => {
        return sum + (parseFloat(splits[participant.friend.id]) || 0);
      }, 0);
      return Math.abs(totalPercentage - 100) < 0.01; // Allow small floating point differences
    }
    
    if (formData.split_type === 'amount') {
      const totalSplitAmount = selectedParticipants.reduce((sum, participant) => {
        return sum + (parseFloat(splits[participant.friend.id]) || 0);
      }, 0);
      return Math.abs(totalSplitAmount - totalAmount) < 0.01;
    }
    
    return true;
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
          <h1 className="text-3xl font-bold text-white">Bills</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            {showCreateForm ? 'Cancel' : 'Create Bill'}
          </button>
        </div>

        {/* Create Bill Form */}
        {showCreateForm && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Create New Bill</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Dinner at restaurant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="food">Food</option>
                    <option value="travel">Travel</option>
                    <option value="utilities">Utilities</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Split Type
                  </label>
                  <select
                    name="split_type"
                    value={formData.split_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="equal">Equal Split</option>
                    <option value="percentage">Percentage</option>
                    <option value="amount">Custom Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Participants
                </label>
                <select
                  multiple
                  name="participants"
                  value={formData.participants}
                  onChange={handleParticipantsChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                >
                  {friends.map((friend) => (
                    <option key={friend.friend_info.id} value={friend.friend_info.id}>
                      {friend.friend_info.username}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-dark-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              {/* Custom Split Fields */}
              {formData.split_type !== 'equal' && formData.participants.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">
                    Split Details
                    {formData.split_type === 'percentage' && (
                      <span className="text-sm text-dark-400 ml-2">
                        (Total: {getSelectedParticipants().reduce((sum, p) => sum + (parseFloat(splits[p.friend.id]) || 0), 0).toFixed(1)}%)
                      </span>
                    )}
                    {formData.split_type === 'amount' && (
                      <span className="text-sm text-dark-400 ml-2">
                        (Total: ₹{getSelectedParticipants().reduce((sum, p) => sum + (parseFloat(splits[p.friend.id]) || 0), 0).toFixed(2)})
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getSelectedParticipants().map((participant) => (
                      <div key={participant.friend.id} className="flex items-center space-x-3">
                        <label className="text-white min-w-0 flex-1 truncate">
                          {participant.friend.username}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={formData.split_type === 'percentage' ? '100' : formData.amount}
                            value={splits[participant.friend.id] || ''}
                            onChange={(e) => handleSplitChange(participant.friend.id, e.target.value)}
                            placeholder={formData.split_type === 'percentage' ? '%' : '₹'}
                            className="w-20 px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <span className="text-dark-400 text-sm">
                            {formData.split_type === 'percentage' ? '%' : '₹'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.split_type === 'percentage' && (
                    <p className="text-sm text-amber-400">
                      💡 Percentages should add up to 100%
                    </p>
                  )}
                  {formData.split_type === 'amount' && (
                    <p className="text-sm text-amber-400">
                      💡 Amounts should add up to ₹{parseFloat(formData.amount || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {groups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Group (Optional)
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm text-dark-300">Recurring Bill</label>
              </div>

              {formData.is_recurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Recurrence
                    </label>
                    <select
                      name="recurrence_type"
                      value={formData.recurrence_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      name="next_due_date"
                      value={formData.next_due_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
              >
                Create Bill
              </button>
            </form>
          </div>
        )}

        {/* Bills List */}
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-medium text-white mb-2">No bills yet</h3>
              <p className="text-dark-400">Create your first bill to get started!</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{bill.desc}</h3>
                    <p className="text-dark-400 text-sm">
                      Created by {bill.created_by.username} on{' '}
                      {new Date(bill.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded">
                        {bill.category}
                      </span>
                      <span className="px-2 py-1 bg-dark-600 text-white text-xs rounded">
                        {bill.split_type} split
                      </span>
                      {bill.is_recurring && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                          {bill.recurrence_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{bill.amount}</p>
                    <p className="text-dark-400 text-sm">
                      {bill.participants.length} participant{bill.participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Bill Splits */}
                {bill.splits && bill.splits.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Split Details:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bill.splits.map((split) => (
                        <div key={split.id} className="flex justify-between text-sm">
                          <span className="text-dark-400">{split.user.username}</span>
                          <span className="text-white">₹{split.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Bills;
