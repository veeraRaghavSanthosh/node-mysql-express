import React, { useState, useEffect } from 'react';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', active: true });

  // Helper: Default form data - centralized to ensure consistency
  const getDefaultFormData = () => ({ name: '', email: '', active: true });

  // Helper: Reset form to default state
  const resetForm = () => {
    setFormData(getDefaultFormData());
    setEditingCustomer(null);
    setError(null);
  };

  // Helper: Generic API request handler with consistent loading/error state management
  // This reduces code duplication and ensures uniform error handling across all API calls
  const makeApiRequest = async (requestFn, errorPrefix = 'API request failed') => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestFn();
      
      // Edge case: Handle non-ok responses that don't throw automatically
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (err) {
      // Edge case: Network errors, timeout, or other fetch failures
      const errorMessage = err.name === 'TypeError' && err.message.includes('fetch')
        ? 'Network error - please check your connection'
        : `${errorPrefix}: ${err.message}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const response = await makeApiRequest(
        () => fetch('/customers'),
        'Failed to fetch customers'
      );
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      // Error already handled by makeApiRequest
    }
  };

  // Create a new customer
  const createCustomer = async (customerData) => {
    try {
      const response = await makeApiRequest(
        () => fetch('/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData),
        }),
        'Failed to create customer'
      );
      const data = await response.json();
      setCustomers(prev => [...prev, data]);
      resetForm();
    } catch (err) {
      // Error already handled by makeApiRequest
    }
  };

  // Update an existing customer
  const updateCustomer = async (id, customerData) => {
    try {
      const response = await makeApiRequest(
        () => fetch(`/customers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData),
        }),
        'Failed to update customer'
      );
      const data = await response.json();
      
      // Edge case: Ensure the customer still exists in the list before updating
      // This handles race conditions where customer might be deleted by another user
      setCustomers(prev => {
        const customerExists = prev.some(customer => customer.id === id);
        if (!customerExists) {
          setError('Customer no longer exists - it may have been deleted');
          return prev;
        }
        return prev.map(customer => customer.id === id ? data : customer);
      });
      resetForm();
    } catch (err) {
      // Error already handled by makeApiRequest
    }
  };

  // Delete a customer
  const deleteCustomer = async (id) => {
    try {
      await makeApiRequest(
        () => fetch(`/customers/${id}`, { method: 'DELETE' }),
        'Failed to delete customer'
      );
      
      // Edge case: Only remove from UI if customer actually existed
      setCustomers(prev => {
        const customerExists = prev.some(customer => customer.id === id);
        if (!customerExists) {
          setError('Customer was already deleted');
          return prev;
        }
        return prev.filter(customer => customer.id !== id);
      });
    } catch (err) {
      // Error already handled by makeApiRequest
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Helper: Validate form data with comprehensive checks
  const validateFormData = (data) => {
    const errors = [];
    
    // Edge case: Handle empty or whitespace-only strings
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required and cannot be empty');
    }
    
    // Edge case: Basic email validation to catch obvious mistakes
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      errors.push('Please enter a valid email address');
    }
    
    // Edge case: Name length validation to prevent database issues
    if (data.name && data.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Edge case: Prevent double-submission while request is in progress
    if (loading) {
      return;
    }
    
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    
    // Trim whitespace from form data to prevent issues
    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim()
    };
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, cleanedData);
    } else {
      createCustomer(cleanedData);
    }
  };

  const handleEdit = (customer) => {
    // Edge case: Prevent editing while another operation is in progress
    if (loading) {
      return;
    }
    
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      active: customer.active !== undefined ? customer.active : true
    });
    setError(null); // Clear any existing errors when starting edit
  };

  const handleCancel = () => {
    resetForm(); // Use centralized reset function
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Edge case: Handle different input types consistently
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Edge case: Clear error when user starts typing to fix validation issues
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="app">
      <h1>Customer Management</h1>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="customer-form">
        <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
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
            />
            Active
          </label>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (editingCustomer ? 'Update' : 'Create')}
          </button>
          {editingCustomer && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="customers-list">
        <h2>Customers</h2>
        {/* Edge case: Show loading state to prevent user confusion during API calls */}
        {loading && <div className="loading">Loading customers...</div>}
        
        {/* Edge case: Handle empty state gracefully when no data is available */}
        {customers.length === 0 && !loading && (
          <div className="empty-state">No customers found</div>
        )}
        
        {customers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-info">
              {/* Edge case: Handle missing customer data gracefully */}
              <h3>{customer.name || 'Unnamed Customer'}</h3>
              <p>Email: {customer.email || 'No email provided'}</p>
              <p>Status: {customer.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="customer-actions">
              {/* Edge case: Disable buttons during loading to prevent race conditions */}
              <button onClick={() => handleEdit(customer)} disabled={loading}>
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
    </div>
  );
};

export default App;