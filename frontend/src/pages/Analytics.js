import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, insightsRes] = await Promise.all([
        analyticsAPI.get(),
        analyticsAPI.insights(),
      ]);
      setAnalyticsData(analyticsRes.data);
      setInsights(insightsRes.data.insight);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      travel: '✈️',
      utilities: '🏠',
      entertainment: '🎉',
      other: '📦',
    };
    return icons[category] || '📦';
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
        <h1 className="text-3xl font-bold text-white">Analytics</h1>

        {/* Insights */}
        {insights && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">💡 Smart Insights</h3>
            {Array.isArray(insights) ? (
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.priority === 'high' ? 'bg-red-900/20 border-red-500' :
                    insight.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                    'bg-blue-900/20 border-blue-500'
                  }`}>
                    <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                    <p className="text-dark-300 text-sm">{insight.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-300">{insights}</p>
            )}
          </div>
        )}

        {/* Summary Statistics */}
        {analyticsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-400">{analyticsData.summary.total_bills}</p>
                <p className="text-dark-300 text-sm">Total Bills</p>
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">₹{analyticsData.summary.total_amount.toFixed(2)}</p>
                <p className="text-dark-300 text-sm">Total Spent</p>
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">₹{analyticsData.summary.avg_bill_amount.toFixed(2)}</p>
                <p className="text-dark-300 text-sm">Avg per Bill</p>
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">₹{analyticsData.summary.most_expensive_bill.amount.toFixed(2)}</p>
                <p className="text-dark-300 text-sm">Highest Bill</p>
                {analyticsData.summary.most_expensive_bill.description && (
                  <p className="text-dark-400 text-xs mt-1">{analyticsData.summary.most_expensive_bill.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Trends */}
        {analyticsData?.summary?.recent_trend && (
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
            <h3 className="text-lg font-medium text-white mb-4">📊 Recent Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-400">
                  ₹{analyticsData.summary.recent_trend.last_30_days.total.toFixed(2)}
                </p>
                <p className="text-dark-300 text-sm">Last 30 Days</p>
                <p className="text-dark-400 text-xs">{analyticsData.summary.recent_trend.last_30_days.count} bills</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark-400">
                  ₹{analyticsData.summary.recent_trend.previous_30_days.total.toFixed(2)}
                </p>
                <p className="text-dark-300 text-sm">Previous 30 Days</p>
                <p className="text-dark-400 text-xs">{analyticsData.summary.recent_trend.previous_30_days.count} bills</p>
              </div>
            </div>
            {(() => {
              const current = analyticsData.summary.recent_trend.last_30_days.total;
              const previous = analyticsData.summary.recent_trend.previous_30_days.total;
              if (previous > 0) {
                const change = ((current - previous) / previous) * 100;
                const isIncrease = change > 0;
                return (
                  <div className={`text-center mt-4 p-3 rounded-lg ${isIncrease ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
                    <span className={`font-medium ${isIncrease ? 'text-red-400' : 'text-green-400'}`}>
                      {isIncrease ? '↗️' : '↘️'} {Math.abs(change).toFixed(1)}% {isIncrease ? 'increase' : 'decrease'} from last month
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {analyticsData && (
          <>
            {/* Spending by Category */}
            {analyticsData.by_category && analyticsData.by_category.length > 0 && (
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <h3 className="text-lg font-medium text-white mb-6">Spending by Category</h3>
                <div className="space-y-4">
                  {analyticsData.by_category.map((item, index) => {
                    const maxAmount = Math.max(...analyticsData.by_category.map(i => parseFloat(i.total)));
                    const percentage = (parseFloat(item.total) / maxAmount) * 100;
                    
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{getCategoryIcon(item.category)}</span>
                            <span className="text-white capitalize">{item.category}</span>
                          </div>
                          <span className="text-primary-400 font-medium">₹{parseFloat(item.total).toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-dark-700 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Category Summary */}
                <div className="mt-6 pt-6 border-t border-dark-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-400">
                        {analyticsData.by_category.length}
                      </p>
                      <p className="text-dark-300 text-sm">Categories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        ₹{analyticsData.by_category.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2)}
                      </p>
                      <p className="text-dark-300 text-sm">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        ₹{(analyticsData.by_category.reduce((sum, item) => sum + parseFloat(item.total), 0) / analyticsData.by_category.length).toFixed(2)}
                      </p>
                      <p className="text-dark-300 text-sm">Avg per Category</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {analyticsData.by_category[0]?.category || 'N/A'}
                      </p>
                      <p className="text-dark-300 text-sm">Top Category</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Spending Trend */}
            {analyticsData.by_month && analyticsData.by_month.length > 0 && (
              <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                <h3 className="text-lg font-medium text-white mb-6">Monthly Spending Trend</h3>
                <div className="space-y-4">
                  {analyticsData.by_month.map((item, index) => {
                    const maxAmount = Math.max(...analyticsData.by_month.map(i => parseFloat(i.total)));
                    const percentage = (parseFloat(item.total) / maxAmount) * 100;
                    
                    return (
                      <div key={item.month} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white">{getMonthName(item.month)}</span>
                          <span className="text-primary-400 font-medium">₹{parseFloat(item.total).toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-dark-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly Summary */}
                <div className="mt-6 pt-6 border-t border-dark-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-400">
                        {analyticsData.by_month.length}
                      </p>
                      <p className="text-dark-300 text-sm">Months</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        ₹{analyticsData.by_month.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2)}
                      </p>
                      <p className="text-dark-300 text-sm">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        ₹{(analyticsData.by_month.reduce((sum, item) => sum + parseFloat(item.total), 0) / analyticsData.by_month.length).toFixed(2)}
                      </p>
                      <p className="text-dark-300 text-sm">Monthly Average</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        ₹{Math.max(...analyticsData.by_month.map(i => parseFloat(i.total))).toFixed(2)}
                      </p>
                      <p className="text-dark-300 text-sm">Highest Month</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
              <h3 className="text-lg font-medium text-white mb-4">💡 Money-Saving Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Track Your Habits</h4>
                  <p className="text-dark-300 text-sm">
                    Review your spending patterns regularly to identify areas where you can cut back.
                  </p>
                </div>
                <div className="bg-dark-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Set Category Budgets</h4>
                  <p className="text-dark-300 text-sm">
                    Consider setting monthly limits for your top spending categories.
                  </p>
                </div>
                <div className="bg-dark-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Split Smarter</h4>
                  <p className="text-dark-300 text-sm">
                    Use groups for recurring expenses to make splitting bills more efficient.
                  </p>
                </div>
                <div className="bg-dark-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Settle Regularly</h4>
                  <p className="text-dark-300 text-sm">
                    Keep track of balances and settle up with friends regularly to avoid confusion.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {(!analyticsData || ((!analyticsData.by_category || analyticsData.by_category.length === 0) && (!analyticsData.by_month || analyticsData.by_month.length === 0))) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-white mb-2">No data to analyze yet</h3>
            <p className="text-dark-400 mb-6">
              Start creating bills to see your spending analytics and insights!
            </p>
            <button
              onClick={() => window.location.href = '/bills'}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md"
            >
              Create Your First Bill
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
