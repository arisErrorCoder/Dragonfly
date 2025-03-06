import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from './firebase';
import { Line, Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';
import Calendar from './Calendar/Calendar';

const Dashboard = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [refundRequests, setRefundRequests] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(fireDB, 'orders'));
        let totalSalesAmount = 0;
        let orderCount = 0;
        let refundCount = 0;
        const orders = [];
        const sales = [];

        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          orderCount++;
          totalSalesAmount += orderData.amount || 0;
          orders.push(orderData);

          // Track sales data for line chart
          sales.push({
            date: orderData.createdAt?.toDate() || new Date(),
            amount: orderData.amount || 0,
          });

          // Check for refund or cancellation requests
          if (
            orderData.refundStatus === 'Processing' ||
            orderData.status === 'cancellation_requested'
          ) {
            refundCount++;
          }
        });

        setTotalSales(totalSalesAmount);
        setOrdersCount(orderCount);
        setRefundRequests(refundCount);
        setOrderData(orders);
        setSalesHistory(sales);

        const usersSnapshot = await getDocs(collection(fireDB, 'users'));
        const usersData = [];
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          usersData.push(user.createdAt?.toDate() || new Date());
        });

        // Group user signups by month
        const monthlyUsers = usersData.reduce((acc, date) => {
          const month = new Date(date).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        setUserGrowth(Object.entries(monthlyUsers).map(([month, count]) => ({ month, count })));
        setNewUsers(usersSnapshot.size);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  // Data for the line chart (Total Sales over Time)
  const lineChartData = {
    labels: salesHistory.map((data) => data.date.toLocaleDateString()),
    datasets: [
      {
        label: 'Total Sales',
        data: salesHistory.map((data) => data.amount),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  // Data for the pie chart (Orders vs Refund Requests)
  const pieChartData = {
    labels: ['Orders', 'Refund Requests'],
    datasets: [
      {
        label: 'Orders',
        data: [ordersCount, refundRequests],
        backgroundColor: ['#4CAF50', '#FF6384'],
      },
    ],
  };

  // Data for bar chart (User Growth by Month)
  const barChartData = {
    labels: userGrowth.map((data) => data.month),
    datasets: [
      {
        label: 'New Users',
        data: userGrowth.map((data) => data.count),
        backgroundColor: '#4CAF50',
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard Overview</h1>
      </header>
      <main className="dashboard-content">
        <div className="data-card">
          <h2>Total Sales</h2>
          <p>₹{totalSales}</p>
        </div>
        <div className="data-card">
          <h2>New Users</h2>
          <p>{newUsers}</p>
        </div>
        <div className="data-card">
          <h2>Orders</h2>
          <p>{ordersCount}</p>
        </div>
        <div className="data-card">
          <h2>Refund Requests</h2>
          <p>{refundRequests}</p>
        </div>

        <Calendar bookedOrders={orderData} />
        <div className="chart-section">
          <div className="chart-container">
            <h3>Sales Over Time</h3>
            <Line data={lineChartData} />
          </div>
          <div className="chart-container">
            <h3>Orders vs Refunds</h3>
            <Pie data={pieChartData} />
          </div>
          <div className="chart-container">
            <h3>User Growth</h3>
            <Bar data={barChartData} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
