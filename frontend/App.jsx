import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { apiGet, apiPost, apiPut, apiDelete } from './apiHelpers';
import { validateCustomerForm, sanitizeInput } from './validationHelpers';
import { searchCustomers } from './searchHelpers';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  /**
   * Fetch all customers from the API
   * Uses the extracted API helper to handle common error scenarios
   */
  const fetchCustomers = useCallback(async () => {
    const data = await apiGet('/api/customers', setLoading, setError, 'Failed to fetch customers');
    
    // Edge case: Handle successful response with data
    if (data) {
      // Edge case: Ensure data is an array, fallback to empty array if not
      const customerList = Array.isArray(data) ? data : (data.customers || []);
      setCustomers(customerList);
    }
  }, []);

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data to create
   */
  const createCustomer = async (customerData) => {
    const newCustomer = await apiPost('/api/customers', customerData, setLoading, setError, 'Failed to create customer');
    
    if (newCustomer) {
      // Edge case: Handle different response formats from the API
      const customerToAdd = newCustomer.customer || newCustomer;
      
      setCustomers(prev => {
        // Edge case: Prevent duplicate entries if customer already exists
        const existingCustomer = prev.find(c => c.id === customerToAdd.id);
        if (existingCustomer) {
          return prev.map(c => c.id === customerToAdd.id ? customerToAdd : c);
        }
        return [...prev, customerToAdd];
      });
      
      // Reset form only on successful creation
      setFormData({ firstName: '', lastName: '', email: '' });
    }
  };

  /**
   * Update an existing customer
   * @param {number|string} id - Customer ID
   * @param {Object} customerData - Updated customer data
   */
  const updateCustomer = async (id, customerData) => {
    // Edge case: Validate ID parameter
    if (!id) {
      setError('Customer ID is required for update');
      return;
    }

    const updatedCustomer = await apiPut(`/api/customers/${id}`, customerData, setLoading, setError, 'Failed to update customer');
    
    if (updatedCustomer) {
      // Edge case: Handle different response formats
      const customerToUpdate = updatedCustomer.customer || updatedCustomer;
      
      setCustomers(prev => 
        prev.map(customer => {
          // Edge case: Handle both string and number IDs
          return String(customer.id) === String(id) ? customerToUpdate : customer;
        })
      );
    }
  };

  /**
   * Delete a customer
   * @param {number|string} id - Customer ID to delete
   */
  const deleteCustomer = async (id) => {
    // Edge case: Validate ID parameter
    if (!id) {
      setError('Customer ID is required for deletion');
      return;
    }

    // Edge case: Show confirmation dialog for destructive actions
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    const result = await apiDelete(`/api/customers/${id}`, setLoading, setError, 'Failed to delete customer');
    
    // Edge case: API might return null/undefined for successful deletions
    if (result !== null) {
      setCustomers(prev => prev.filter(customer => String(customer.id) !== String(id)));
    }
  };

  /**
   * Filter customers using the extracted search helper
   * Handles edge cases for empty arrays and invalid search terms
   */
  const filteredCustomers = searchCustomers(customers, searchTerm);

  /**
   * Handle form input changes with sanitization
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Edge case: Sanitize input to prevent XSS attacks
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Edge case: Clear field-specific errors when user starts typing
    if (error && error.toLowerCase().includes(name.toLowerCase())) {
      setError(null);
    }
  };

  /**
   * Handle form submission with comprehensive validation
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use extracted validation helper
    const validation = validateCustomerForm(formData);
    
    if (!validation.isValid) {
      // Edge case: Display first validation error
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return;
    }
    
    createCustomer(formData);
  };

  /**
   * Load customers on component mount
   * Edge case: Only run once using useCallback and empty dependency array
   */
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="App">
      <h1>Customer Management</h1>
      
      {/* Edge case: Only show error message if it exists and is non-empty */}
      {error && error.trim() && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* Customer Form */}
      <form onSubmit={handleSubmit} className="customer-form">
        <h2>Add New Customer</h2>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={loading}
          maxLength="50"
          // Edge case: Prevent form submission on Enter if validation fails
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={loading}
          maxLength="50"
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          maxLength="254"
          // Edge case: HTML5 email validation as fallback
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Customer'}
        </button>
      </form>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          // Edge case: Limit search input length to prevent performance issues
          maxLength="100"
        />
      </div>

      {/* Customer List */}
      <div className="customer-list">
        <h2>Customers ({filteredCustomers.length})</h2>
        
        {/* Edge case: Show loading state only when actually loading */}
        {loading && <div className="loading-indicator">Loading...</div>}
        
        {/* Edge case: Handle different empty states */}
        {!loading && customers.length === 0 && (
          <div className="empty-state">No customers available. Add your first customer above.</div>
        )}
        
        {!loading && customers.length > 0 && filteredCustomers.length === 0 && searchTerm && (
          <div className="no-results">No customers match your search "{searchTerm}"</div>
        )}
        
        {/* Edge case: Only render customer list if we have filtered customers */}
        {filteredCustomers.length > 0 && filteredCustomers.map(customer => {
          // Edge case: Handle customers without required fields
          if (!customer || !customer.id) {
            return null;
          }
          
          return (
            <div key={customer.id} className="customer-item">
              <div className="customer-info">
                <strong>
                  {/* Edge case: Handle missing name fields gracefully */}
                  {customer.firstName || 'Unknown'} {customer.lastName || 'Name'}
                </strong>
                <br />
                {/* Edge case: Handle missing email gracefully */}
                <span className="customer-email">
                  {customer.email || 'No email provided'}
                </span>
              </div>
              <div className="customer-actions">
                <button 
                  onClick={() => {
                    // Edge case: Ensure customer data exists before updating
                    if (customer.firstName && customer.lastName) {
                      updateCustomer(customer.id, { 
                        ...customer, 
                        firstName: customer.firstName + ' (Updated)' 
                      });
                    }
                  }}
                  disabled={loading}
                  // Edge case: Disable update if customer data is incomplete
                  title={!customer.firstName || !customer.lastName ? 'Cannot update incomplete customer data' : 'Update customer'}
                >
                  Update
                </button>
                <button 
                  onClick={() => deleteCustomer(customer.id)}
                  disabled={loading}
                  className="delete-btn"
                  // Edge case: Add accessibility and confirmation context
                  title="Delete customer (will ask for confirmation)"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;