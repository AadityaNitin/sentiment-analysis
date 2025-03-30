'use client';

import { useState, useEffect } from 'react';
import SignIn from './SignIn';
import { auth, db } from '../firebase';
import { signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Listen for authentication state changes.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch sentiment history from Firestore for the current user.
  useEffect(() => {
    if (user) {
      const historyQuery = query(
        collection(db, 'users', user.uid, 'sentimentHistory'),
        orderBy('timestamp')
      );
      const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const classify = async (text) => {
    if (!text) return;
    setLoading(true);
    
    // Call your analysis API route.
    const response = await fetch(`/analyze?text=${encodeURIComponent(text)}`);
    const data = await response.json();
    setResult(data);
    setLoading(false);

    // If user is signed in, store the sentiment analysis in Firestore.
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'sentimentHistory'), {
          text,
          result: data,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error storing history in Firestore: ", err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      classify(inputText);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  if (authLoading) {
    // Loader while auth state is determined.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  // For a time series chart, reverse the history so that the oldest entry is first.
  const sortedHistory = [...history].reverse();

  // Map scores in percentage (with two decimals).
  const scores = sortedHistory.map(item => parseFloat((item.result[0].score * 100).toFixed(2)));

  // Calculate dynamic y-axis range.
  let suggestedMin = Math.min(...scores);
  let suggestedMax = Math.max(...scores);
  const range = suggestedMax - suggestedMin;
  if (range === 0) {
    suggestedMin = suggestedMin - 1;
    suggestedMax = suggestedMax + 1;
  } else {
    const buffer = range * 0.2;
    suggestedMin = suggestedMin - buffer;
    suggestedMax = suggestedMax + buffer;
  }

  const chartData = {
    labels: history.map((item, index) => `${item.result[0].label} ${index + 1}`),
    datasets: [
      {
        label: 'Sentiment Score (%)',
        data: scores,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        suggestedMin,
        suggestedMax,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sentiment Analysis History',
      },
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-12 bg-white">
      {user && (
        <div className="w-full flex justify-between items-center mb-6">
          <p className="text-black">Welcome, {user.displayName}</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      )}

      {!user ? (
        <SignIn />
      ) : (
        <>
          <h1 className="text-5xl font-bold mb-6 text-center text-black">Sentiment Analysis</h1>
          <div className="w-full max-w-xs mb-6">
            <label htmlFor="input-text" className="block text-sm font-medium text-black mb-1">
              Enter text
            </label>
            <input
              id="input-text"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
              placeholder="Type something and press Enter..."
            />
          </div>

          <div className="w-full max-w-xs">
            {loading && <p className="text-center text-black">Loading...</p>}
            {!loading && result && result[0] && (
              <div className="bg-white shadow p-4 rounded mb-6">
                <h3 className="text-xl font-semibold mb-2 text-black">Classification Result</h3>
                <p className="text-black">
                  <span className="font-medium">Label:</span> {result[0].label}
                </p>
                <p className="text-black">
                  <span className="font-medium">Score:</span> {(result[0].score * 100).toFixed(2)}%
                </p>
              </div>
            )}
            {!loading && !result && (
              <p className="text-center text-black">Waiting for input...</p>
            )}
          </div>

          {history.length > 0 && (
            <div className="w-full max-w-xs mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-black">History</h2>
              <Line data={chartData} options={chartOptions} />
              <ul className="space-y-2 mt-4">
                {sortedHistory.map((item) => (
                  <li key={item.id} className="p-2 border rounded text-black">
                    <p className="text-sm">
                      <span className="font-medium">Text:</span> {item.text}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Label:</span> {item.result[0].label}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Score:</span> {(item.result[0].score * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.timestamp?.toDate().toLocaleString() || 'N/A'}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}
