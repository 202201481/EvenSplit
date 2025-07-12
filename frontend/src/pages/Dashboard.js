import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { balancesAPI, billsAPI, analyticsAPI } from '../services/api';

const Dashboard = () => {
  const [balances, setBalances] = useState({});
  const [recentBills, setRecentBills] = useState([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [balancesRes, billsRes, insightsRes] = await Promise.all([
          balancesAPI.get(),
          billsAPI.list(),
          analyticsAPI.insights(),
        ]);

        setBalances(balancesRes.data);
        setRecentBills(billsRes.data.slice(0, 5)); // Show last 5 bills
        setInsights(insightsRes.data.insight);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOwed = Object.values(balances)
    .filter(amount => amount < 0)
    .reduce((sum, amount) => sum + Math.abs(amount), 0);

  const totalOwedToYou = Object.values(balances)
    .filter(amount => amount > 0)
    .reduce((sum, amount) => sum + amount, 0);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        
        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-2">You Owe</h3>
            <p className="text-3xl font-bold text-red-400">₹{totalOwed.toFixed(2)}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-2">Owed to You</h3>
            <p className="text-3xl font-bold text-green-400">₹{totalOwedToYou.toFixed(2)}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-2">Net Balance</h3>
            <p className={`text-3xl font-bold ${
              (totalOwedToYou - totalOwed) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ₹{(totalOwedToYou - totalOwed).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Detailed Balances */}
        {Object.keys(balances).length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Friend Balances</h3>
            <div className="space-y-3">
              {Object.entries(balances).map(([friend, amount]) => (
                <div key={friend} className="flex justify-between items-center">
                  <span className="text-dark-300">{friend}</span>
                  <span className={`font-medium ${
                    amount >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {amount >= 0 ? `+₹${amount.toFixed(2)}` : `-₹${Math.abs(amount).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bills */}
        {recentBills.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">Recent Bills</h3>
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-white">{bill.desc}</p>
                    <p className="text-sm text-dark-400">
                      by {bill.created_by.username} • {new Date(bill.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-primary-400 font-medium">₹{bill.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">💡 Insight</h3>
            <p className="text-dark-300">{insights}</p>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(balances).length === 0 && recentBills.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-medium text-white mb-2">Welcome to EvenSplit!</h3>
            <p className="text-dark-400 mb-6">Start by adding friends and creating your first bill.</p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/friends'}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Add Friends
              </button>
              <button 
                onClick={() => window.location.href = '/bills'}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Create Bill
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
