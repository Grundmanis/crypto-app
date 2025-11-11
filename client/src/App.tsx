import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { io, Socket } from 'socket.io-client';
import './App.css';

function App() {
  const [coins, setCoins] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [newCoinName, setNewCoinName] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const s = io('http://localhost:3000');
    setSocket(s);

    s.on('coinUpdate', (data) => {
      console.log('Update received', data);
      if (data.action === 'rate_update') {
        console.log("set coins");
        setCoins(data.coins);
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  async function fetchData() {
    const res = await fetch("/api/coins");
    const data = await res.json();
    setCoins(data);
  }

  async function handleAddCoin() {
      const res = await fetch("/api/coins", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCoinName })
      });

      if (res.status === 201) {
        setShowAddModal(false);
        fetchData();
      }
  };

  async function handleDeleteCoin(coinId: number) {
    console.log("coinId",coinId);
    await fetch(`/api/coins/${coinId}`, {
      method: "DELETE",
    });

    setShowDeleteModal(null);
    fetchData();
  };

  return (
    <div className="p-8 grid gap-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Latest Prices</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-2" /> Add Coin
        </button>
      </div>

      <div className="rounded-2xl shadow bg-gray-800 p-6">
        <table className="w-full table-auto border-collapse rounded-xl overflow-hidden shadow">
          <thead className="bg-gray-700 text-gray-200">
            <tr className="text-left border-b border-gray-600">
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Coin</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Price €</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Created</th>
              <th className="p-4 font-semibold uppercase text-xs tracking-wider">Rate updated</th>
              <th className="p-4 w-10" />
              <th className="p-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <>
                <tr
                  key={coin.id}
                  className="cursor-pointer hover:bg-gray-700 transition border-b border-gray-600 group"
                  onClick={() => setExpanded(expanded === coin.id ? null : coin.id)}
                >
                  <td className="p-4 font-medium group-hover:text-blue-400 transition-colors">{coin.name}</td>
                  <td className="p-4">{coin.exchangeRates.length ? coin.exchangeRates[0].currentPrice.eur : ''}</td>
                  <td className="p-4 text-sm text-gray-400">{new Date(coin.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-400">{coin.exchangeRates.length ? new Date(coin.exchangeRates[0].createdAt).toLocaleString() : ''}</td>
                  <td className="p-4">
                    {expanded === coin.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  <td className="p-4">
                    <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(coin.id); }} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>

                {expanded === coin.id && (
                  <tr className="bg-gray-700 border-t border-gray-600">
                    <td colSpan={5} className="p-4">
                      <h3 className="font-semibold mb-3 text-gray-200">Price History</h3>
                      <table className="w-full table-auto border-collapse text-sm rounded-lg overflow-hidden shadow-inner">
                        <thead className="bg-gray-600 text-gray-200">
                          <tr className="border-b border-gray-500">
                            <th className="p-2 text-left">#</th>
                            <th className="p-2 text-left">Price €</th>
                            <th className="p-2 text-left">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coin.exchangeRates.map((h, idx) => (
                            <tr key={idx} className="border-b border-gray-500">
                              <td className="p-2">{idx + 1}</td>
                              <td className="p-2">{h.currentPrice.eur}</td>
                              <td className="p-2 text-gray-400">{new Date(h.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Coin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Coin</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <input className="w-full p-2 mb-3 rounded bg-gray-700 text-gray-200" placeholder="Coin Name" value={newCoinName} onChange={(e) => setNewCoinName(e.target.value)} />
            <button onClick={handleAddCoin} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Add</button>
          </div>
        </div>
      )}

      {/* Delete Coin Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this coin?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
              <button onClick={() => handleDeleteCoin(showDeleteModal)} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;