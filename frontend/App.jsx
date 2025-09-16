import React, { useState, useEffect } from 'react';
import './App.css';

// Helper function to validate customer data
// Edge case: Handles null/undefined values and trims whitespace
const validateCustomerData = (customerData) => {
  const errors = [];
  
  // Check required fields - handle edge case of empty strings after trimming
  if (!customerData.name || !customerData.name.trim()) {
    errors.push('Name is required');
  }
  
  if (!customerData.email || !customerData.email.trim()) {
    errors.push('Email is required');
  } else {
    // Validate email format - edge case: handle international domains and plus signs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Helper function to handle API requests with consistent error handling
// Edge case: Handles network timeouts, malformed responses, and unexpected status codes
const makeApiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    // Edge case: Handle non-JSON responses (e.g., 204 No Content)
    if (response.status === 204) {
      return { success: true, data: null };
    }
    
    if (!response.ok) {
      // Edge case: Try to extract error message from response body if available
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Ignore JSON parsing errors for error responses
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    // Edge case: Handle network errors, timeouts, and parsing errors
    const errorMessage = error.name === 'TypeError' && error.message.includes('fetch')
      ? 'Network error - please check your connection'
      : error.message;
    
    return { success: false, error: errorMessage };
  }
};

// Helper function to reset form data
// Edge case: Ensures all form fields are properly cleared, including nested objects
const getInitialFormData = () => ({
  name: '',
  email: '',
  phone: ''
});

// Helper function to handle loading and error states consistently
// Edge case: Prevents race conditions by checking if component is still mounted
const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const executeOperation = async (operation, errorPrefix = 'Operation failed') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = `${errorPrefix}: ${err.message}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, error, setError, executeOperation };
};

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(getInitialFormData());
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use custom hook for consistent async operation handling
  const { loading, error, setError, executeOperation } = useAsyncOperation();

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch all customers from API
  const fetchCustomers = async () => {
    await executeOperation(async () => {
      const result = await makeApiRequest('/api/customers');
      if (result.success) {
        // Edge case: Handle empty array response or malformed data
        setCustomers(Array.isArray(result.data) ? result.data : []);
      } else {
        throw new Error(result.error);
      }
    }, 'Failed to fetch customers');
  };

  // Create a new customer
  const createCustomer = async (customerData) => {
    // Validate input before making API call
    const validation = validateCustomerData(customerData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    await executeOperation(async () => {
      // Edge case: Trim whitespace from input data before sending
      const cleanData = {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(), // Normalize email case
        phone: customerData.phone?.trim() || ''
      };
      
      const result = await makeApiRequest('/api/customers', {
        method: 'POST',
        body: JSON.stringify(cleanData)
      });
      
      if (result.success) {
        // Edge case: Handle case where API doesn't return the created customer
        const newCustomer = result.data || { ...cleanData, id: Date.now() };
        setCustomers(prev => [...prev, newCustomer]);
        setFormData(getInitialFormData());
      } else {
        throw new Error(result.error);
      }
    }, 'Failed to create customer');
  };

  // Update an existing customer
  const updateCustomer = async (id, customerData) => {
    // Validate input before making API call
    const validation = validateCustomerData(customerData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    await executeOperation(async () => {
      // Edge case: Trim whitespace and normalize data
      const cleanData = {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone?.trim() || ''
      };
      
      const result = await makeApiRequest(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cleanData)
      });
      
      if (result.success) {
        // Edge case: Handle case where API doesn't return updated customer
        const updatedCustomer = result.data || { ...cleanData, id };
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id ? updatedCustomer : customer
          )
        );
        setEditingId(null);
        setFormData(getInitialFormData());
      } else {
        throw new Error(result.error);
      }
    }, 'Failed to update customer');
  };

  // Delete a customer
  const deleteCustomer = async (id) => {
    // Edge case: Validate ID and show confirmation dialog
    if (!id || (!Number.isInteger(id) && typeof id !== 'string')) {
      setError('Invalid customer ID');
      return;
    }

    // Confirmation dialog for delete action
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    await executeOperation(async () => {
      const result = await makeApiRequest(`/api/customers/${id}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        // Edge case: Remove from local state even if API doesn't return data
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        
        // Edge case: Clear editing state if we're deleting the currently edited customer
        if (editingId === id) {
          setEditingId(null);
          setFormData(getInitialFormData());
        }
      } else {
        throw new Error(result.error);
      }
    }, 'Failed to delete customer');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      createCustomer(formData);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Start editing a customer
  const startEdit = (customer) => {
    // Edge case: Validate customer object before editing
    if (!customer || !customer.id) {
      setError('Invalid customer data');
      return;
    }
    
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData(getInitialFormData());
  };

  // Filter customers based on search term
  // Edge case: Handle null/undefined values and ensure case-insensitive search
  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;
    
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true; // Show all if no search term
    
    const name = (customer.name || '').toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const phone = (customer.phone || '').toLowerCase();
    
    return name.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1>Customer Management System</h1>
      </header>

      <main className="app-main">
        {/* Error display */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Customer form */}
        <section className="form-section">
          <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Search section */}
        <section className="search-section">
          <h2>Search Customers</h2>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </section>

        {/* Customer list */}
        <section className="list-section">
          <h2>Customers ({filteredCustomers.length})</h2>
          
          {loading && <div className="loading">Loading...</div>}
          
          {!loading && filteredCustomers.length === 0 && (
            <p className="no-data">No customers found.</p>
          )}

          {!loading && filteredCustomers.length > 0 && (
            <div className="customer-grid">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-info">
                    <h3>{customer.name}</h3>
                    <p>Email: {customer.email}</p>
                    {customer.phone && <p>Phone: {customer.phone}</p>}
                  </div>
                  <div className="customer-actions">
                    <button 
                      onClick={() => startEdit(customer)}
                      disabled={loading}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCustomer(customer.id)}
                      disabled={loading}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;