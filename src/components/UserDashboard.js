
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function UserDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false
  });
  const { getAuthHeaders, logout } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/items', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem 
        ? `http://localhost:5000/items/${editingItem._id}`
        : 'http://localhost:5000/items';
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Operation failed');
      }

      const data = await response.json();
      
      if (editingItem) {
        setItems(items.map(item => item._id === data._id ? data : item));
      } else {
        setItems([...items, data]);
      }

      resetForm();
    } catch (err) {
      setError('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`http://localhost:5000/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      setError('Delete failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      completed: item.completed
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', completed: false });
    setShowForm(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <header>
        <h1>User Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>
      <div className="content">
        <div className="header-actions">
          <h2>My Items</h2>
          <button onClick={() => setShowForm(true)}>Add New Item</button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="item-form">
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => setFormData({...formData, completed: e.target.checked})}
              />
              Completed
            </label>
            <div className="form-actions">
              <button type="submit">{editingItem ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.completed ? 'Completed' : 'Pending'}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserDashboard;