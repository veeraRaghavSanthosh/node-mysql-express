const userModule = require('./src/api/user');

// Example of safe usage with proper error handling
async function demonstrateUsage() {
  console.log('=== User API Module Usage Examples ===\n');

  try {
    // Example 1: Safe user creation
    console.log('1. Creating a new user...');
    const newUser = await userModule.createUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      address: '123 Main St'
    });
    console.log('Success:', newUser);
  } catch (error) {
    console.error('Error creating user:', error.message);
  }

  try {
    // Example 2: Handling null input (will throw error)
    console.log('\n2. Attempting to create user with null input...');
    await userModule.createUser(null);
  } catch (error) {
    console.error('Expected error caught:', error.message);
  }

  try {
    // Example 3: Handling invalid input type (will throw error)
    console.log('\n3. Attempting to create user with invalid input type...');
    await userModule.createUser('invalid input');
  } catch (error) {
    console.error('Expected error caught:', error.message);
  }

  try {
    // Example 4: Safe user retrieval (backward compatible)
    console.log('\n4. Getting user by ID (backward compatible)...');
    const user = await userModule.getUserById(1);
    console.log('Success:', user);
  } catch (error) {
    console.error('Error getting user:', error.message);
  }

  try {
    // Example 5: Safe user retrieval with object parameter
    console.log('\n5. Getting user by ID (object parameter)...');
    const user = await userModule.getUserById({ id: 1 });
    console.log('Success:', user);
  } catch (error) {
    console.error('Error getting user:', error.message);
  }

  try {
    // Example 6: Handling null input for getUserById
    console.log('\n6. Attempting to get user with null input...');
    await userModule.getUserById(null);
  } catch (error) {
    console.error('Expected error caught:', error.message);
  }

  try {
    // Example 7: Safe getAllUsers with null options
    console.log('\n7. Getting all users with null options...');
    const users = await userModule.getAllUsers(null);
    console.log('Success:', users);
  } catch (error) {
    console.error('Error getting users:', error.message);
  }

  try {
    // Example 8: Input validation demonstration
    console.log('\n8. Testing input validation...');
    const validation = userModule.validateInput(null, 'create');
    console.log('Validation result:', validation);
  } catch (error) {
    console.error('Error in validation:', error.message);
  }

  console.log('\n=== All examples completed ===');
}

// Only run if this file is executed directly
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

module.exports = { demonstrateUsage };
