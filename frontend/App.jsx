import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:3000';

// Helper function to handle API errors consistently
const handleApiError = (err, setError) => {
  console.error('API Error:', err);
  
  // Edge case: Check if error response exists (server responded with error status)
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || 'Unknown server error';
    
    // Edge case: Handle specific HTTP status codes
    if (status === 404) {
      setError('Resource not found. It may have been deleted.');
    } else if (status === 400) {
      setError(`Invalid request: ${message}`);
    } else if (status === 500) {
      setError('Server error. Please try again later.');
    } else {
      setError(`Server error: ${status} - ${message}`);
    }
  } 
  // Edge case: Network error (no response received)
  else if (err.request) {
    setError('Network error: Unable to connect to server. Please check your connection.');
  } 
  // Edge case: Request setup error
  else {
    setError('Request error: ' + err.message);
  }
};

// Helper function to validate customer data
const validateCustomerData = (customerData, setError) => {
  // Edge case: Check for required fields
  if (!customerData.name?.trim()) {
    setError('Name is required and cannot be empty');
    return false;
  }
  
  if (!customerData.email?.trim()) {
    setError('Email is required and cannot be empty');
    return false;
  }
  
  // Edge case: Basic email validation (more comprehensive than just checking for @)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerData.email.trim())) {
    setError('Please enter a valid email address');
    return false;
  }
  
  // Edge case: Check email length to prevent extremely long emails
  if (customerData.email.length > 254) {
    setError('Email address is too long (maximum 254 characters)');
    return false;
  }
  
  // Edge case: Check name length
  if (customerData.name.length > 100) {
    setError('Name is too long (maximum 100 characters)');
    return false;
  }
  
  return true;
};

// Helper function to make API requests with consistent error handling
const makeApiRequest = async (requestFn, setLoading, setError, onSuccess, onFinally) => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await requestFn();
    if (onSuccess) {
      onSuccess(result);
    }
    return result;
  } catch (err) {
    handleApiError(err, setError);
    throw err; // Re-throw for caller to handle if needed
  } finally {
    setLoading(false);
    if (onFinally) {
      onFinally();
    }
  }
};

/**
 * Customer Management App Component
 * 
 * Edge Case Handling Strategy:
 * 1. API Errors: Comprehensive error handling for network, server, and request errors
 * 2. Data Validation: Client-side validation with proper error messages
 * 3. Missing Data: Graceful handling of null/undefined customer properties
 * 4. State Consistency: Optimistic updates with fallback to refresh on inconsistencies
 * 5. User Experience: Loading states, confirmation dialogs, and immediate error feedback
 * 6. Accessibility: ARIA labels and proper form semantics
 * 7. Race Conditions: Prevent double submissions and handle concurrent operations
 */
function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    active: true
  });

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch all customers - now using helper function
  const fetchCustomers = async () => {
    try {
      await makeApiRequest(
        () => axios.get(`${API_BASE_URL}/customers`),
        setLoading,
        setError,
        (response) => {
          // Edge case: Handle empty or null response data
          if (response.data && Array.isArray(response.data)) {
            setCustomers(response.data);
          } else {
            // Edge case: Server returned non-array data
            console.warn('Server returned non-array data for customers:', response.data);
            setCustomers([]);
          }
        }
      );
    } catch (err) {
      // Edge case: Ensure customers list is cleared on error
      setCustomers([]);
    }
  };

  // Create new customer - now using helper functions
  const createCustomer = async (customerData) => {
    // Use validation helper
    if (!validateCustomerData(customerData, setError)) {
      return;
    }

    try {
      await makeApiRequest(
        () => axios.post(`${API_BASE_URL}/customers`, customerData),
        setLoading,
        setError,
        (response) => {
          // Edge case: Verify response contains customer data
          if (response.data && response.data.id) {
            setCustomers(prev => [...prev, response.data]);
            setFormData({ name: '', email: '', active: true });
          } else {
            // Edge case: Server didn't return proper customer data
            console.warn('Server returned invalid customer data:', response.data);
            // Refresh the list to ensure consistency
            fetchCustomers();
          }
        }
      );
    } catch (err) {
      // Error already handled by makeApiRequest helper
    }
  };

  // Update customer - now using helper functions
  const updateCustomer = async (customerId, customerData) => {
    // Edge case: Validate customer ID
    if (!customerId) {
      setError('Invalid customer ID');
      return;
    }

    // Use validation helper
    if (!validateCustomerData(customerData, setError)) {
      return;
    }

    try {
      await makeApiRequest(
        () => axios.put(`${API_BASE_URL}/customers/${customerId}`, customerData),
        setLoading,
        setError,
        (response) => {
          // Edge case: Verify response contains updated customer data
          if (response.data && response.data.id) {
            setCustomers(prev => prev.map(customer => 
              customer.id === customerId ? response.data : customer
            ));
            setEditingCustomer(null);
            setFormData({ name: '', email: '', active: true });
          } else {
            // Edge case: Server didn't return proper customer data
            console.warn('Server returned invalid updated customer data:', response.data);
            // Refresh the list to ensure consistency
            fetchCustomers();
            setEditingCustomer(null);
            setFormData({ name: '', email: '', active: true });
          }
        }
      );
    } catch (err) {
      // Error already handled by makeApiRequest helper
    }
  };

  // Delete customer - now using helper function
  const deleteCustomer = async (customerId) => {
    // Edge case: Validate customer ID
    if (!customerId) {
      setError('Invalid customer ID');
      return;
    }

    // Edge case: Confirm deletion to prevent accidental deletions
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      await makeApiRequest(
        () => axios.delete(`${API_BASE_URL}/customers/${customerId}`),
        setLoading,
        setError,
        () => {
          // Edge case: Optimistically remove from UI, but also handle case where customer might not exist
          setCustomers(prev => {
            const filtered = prev.filter(customer => customer.id !== customerId);
            // Edge case: If no customer was removed, it might have been already deleted
            if (filtered.length === prev.length) {
              console.warn(`Customer with ID ${customerId} was not found in local state`);
            }
            return filtered;
          });
          
          // Edge case: If we were editing the deleted customer, clear the form
          if (editingCustomer && editingCustomer.id === customerId) {
            setEditingCustomer(null);
            setFormData({ name: '', email: '', active: true });
          }
        }
      );
    } catch (err) {
      // Error already handled by makeApiRequest helper
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Edge case: Prevent double submission while loading
    if (loading) {
      return;
    }
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      createCustomer(formData);
    }
  };

  // Handle edit button click
  const handleEdit = (customer) => {
    // Edge case: Validate customer object before editing
    if (!customer || !customer.id) {
      setError('Invalid customer data');
      return;
    }
    
    setEditingCustomer(customer);
    setFormData({
      // Edge case: Handle missing or null customer properties
      name: customer.name || '',
      email: customer.email || '',
      // Edge case: Handle boolean active field that could be undefined, null, or false
      active: customer.active !== undefined && customer.active !== null ? customer.active : true
    });
    
    // Edge case: Clear any existing errors when starting to edit
    setError(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', active: true });
    setError(null); // Edge case: Clear errors when canceling
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Edge case: Clear error when user starts typing (provides immediate feedback)
    if (error) {
      setError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      // Edge case: Handle different input types (text, email, checkbox)
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Customer Management System</h1>
      </header>

      <main className="App-main">
        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Customer Form */}
        <section className="customer-form-section">
          <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Enter customer email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="active">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                Active Customer
              </label>
            </div>
            
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingCustomer ? 'Update Customer' : 'Add Customer')}
              </button>
              {editingCustomer && (
                <button type="button" onClick={handleCancelEdit} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Customer List */}
        <section className="customer-list-section">
          <div className="section-header">
            <h2>Customers ({customers.length})</h2>
            <button onClick={fetchCustomers} disabled={loading} className="refresh-button">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {/* Edge case: Show loading only when customers array is empty (initial load) */}
          {loading && customers.length === 0 ? (
            <div className="loading-message">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="empty-message">No customers found. Add your first customer above.</div>
          ) : (
            <div className="customer-grid">
              {customers.map(customer => {
                // Edge case: Skip rendering customers without valid IDs
                if (!customer.id) {
                  console.warn('Skipping customer without ID:', customer);
                  return null;
                }
                
                return (
                  <div key={customer.id} className={`customer-card ${customer.active ? 'active' : 'inactive'}`}>
                    <div className="customer-info">
                      {/* Edge case: Handle missing customer name */}
                      <h3>{customer.name || 'Unnamed Customer'}</h3>
                      {/* Edge case: Handle missing customer email */}
                      <p className="customer-email">{customer.email || 'No email'}</p>
                      <p className="customer-status">
                        Status: <span className={customer.active ? 'status-active' : 'status-inactive'}>
                          {/* Edge case: Handle undefined/null active status */}
                          {customer.active ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="customer-actions">
                      <button 
                        onClick={() => handleEdit(customer)}
                        disabled={loading}
                        className="edit-button"
                        // Edge case: Add aria-label for accessibility
                        aria-label={`Edit customer ${customer.name || 'Unnamed'}`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
                        disabled={loading}
                        className="delete-button"
                        // Edge case: Add aria-label for accessibility
                        aria-label={`Delete customer ${customer.name || 'Unnamed'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;