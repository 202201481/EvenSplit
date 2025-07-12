import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { settlementsAPI, friendsAPI, balancesAPI } from '../services/api';

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [friends, setFriends] = useState([]);
  const [balances, setBalances] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    payee_id: '',
    amount: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settlementsRes, friendsRes, balancesRes] = await Promise.all([
        settlementsAPI.list(),
        friendsAPI.list(),
        balancesAPI.get(),
      ]);
      setSettlements(settlementsRes.data);
      setFriends(friendsRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const settlementData = {
        payee_id: parseInt(formData.payee_id),
        amount: parseFloat(formData.amount),
      };
      
      await settlementsAPI.create(settlementData);
      setShowCreateForm(false);
      setFormData({ payee_id: '', amount: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getPayableFriends = () => {
    return friends.filter(friend => {
      const balance = balances[friend.friend_info.username];
      return balance && balance < 0; // You owe them money
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

  const payableFriends = getPayableFriends();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Settlements</h1>
          {payableFriends.length > 0 && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
            >
              {showCreateForm ? 'Cancel' : 'Record Payment'}
            </button>
          )}
        </div>

        {/* Outstanding Balances */}
        {Object.keys(balances).length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Outstanding Balances</h3>
            <div className="space-y-3">
              {Object.entries(balances).map(([friend, amount]) => (
                <div key={friend} className="flex justify-between items-center p-3 bg-dark-700 rounded-md">
                  <span className="text-white">{friend}</span>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium ${
                      amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {amount >= 0 ? `Owes you ₹${amount.toFixed(2)}` : `You owe ₹${Math.abs(amount).toFixed(2)}`}
                    </span>
                    {amount < 0 && (
                      <button
                        onClick={() => {
                          const friendObj = friends.find(f => f.friend_info.username === friend);
                          if (friendObj) {
                            setFormData({
                              payee_id: friendObj.friend_info.id.toString(),
                              amount: Math.abs(amount).toFixed(2),
                            });
                            setShowCreateForm(true);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Record Payment Form */}
        {showCreateForm && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Record Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Pay To
                </label>
                <select
                  name="payee_id"
                  value={formData.payee_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select friend...</option>
                  {friends.map((friend) => (
                    <option key={friend.friend_info.id} value={friend.friend_info.id}>
                      {friend.friend_info.username}
                      {balances[friend.friend_info.username] && balances[friend.friend_info.username] < 0 && 
                        ` (You owe ₹${Math.abs(balances[friend.friend_info.username]).toFixed(2)})`
                      }
                    </option>
                  ))}
                </select>
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

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
              >
                Record Payment
              </button>
            </form>
          </div>
        )}

        {/* Settlements History */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">Payment History</h3>
          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💸</div>
              <h4 className="text-xl font-medium text-white mb-2">No payments yet</h4>
              <p className="text-dark-400">
                {payableFriends.length > 0 
                  ? "Record your first payment to settle up with friends!"
                  : "You're all settled up! No outstanding balances."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement) => (
                <div key={settlement.id} className="p-4 bg-dark-700 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white">
                        <span className="font-medium">{settlement.payer.username}</span> paid{' '}
                        <span className="font-medium">{settlement.payee.username}</span>
                      </p>
                      <p className="text-dark-400 text-sm">
                        {new Date(settlement.created_at).toLocaleDateString()} at{' '}
                        {new Date(settlement.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">₹{settlement.amount}</p>
                      {settlement.bill && (
                        <p className="text-dark-400 text-xs">For: {settlement.bill.desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settlement Summary */}
        {settlements.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  ${settlements
                    .filter(s => s.payer.username === 'current_user') // This would be the actual current user
                    .reduce((sum, s) => sum + parseFloat(s.amount), 0)
                    .toFixed(2)}
                </p>
                <p className="text-dark-300 text-sm">Total Paid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  ${settlements
                    .filter(s => s.payee.username === 'current_user') // This would be the actual current user
                    .reduce((sum, s) => sum + parseFloat(s.amount), 0)
                    .toFixed(2)}
                </p>
                <p className="text-dark-300 text-sm">Total Received</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settlements;
