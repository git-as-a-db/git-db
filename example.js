/**
 * Example usage of GitJsonDB module
 * Demonstrates CRUD operations, ACID compliance, and advanced features
 */

const GitJsonDB = require('./git-json-db');

// Example 1: Basic setup and CRUD operations
async function basicExample() {
  console.log('=== Basic CRUD Operations Example ===');
  
  // Initialize database with default settings
  const db = new GitJsonDB();
  
  try {
    // CREATE - Add users
    const user1 = await db.create('users', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    console.log('Created user:', user1);
    
    const user2 = await db.create('users', {
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25
    });
    console.log('Created user:', user2);
    
    // CREATE - Add products
    const product1 = await db.create('products', {
      name: 'Laptop',
      price: 999.99,
      category: 'electronics'
    });
    console.log('Created product:', product1);
    
    // READ - Get all users
    const allUsers = await db.read('users');
    console.log('All users:', allUsers);
    
    // READ - Get users with filter
    const youngUsers = await db.read('users', { age: 25 });
    console.log('Users aged 25:', youngUsers);
    
    // READ BY ID
    const specificUser = await db.readById('users', user1.id);
    console.log('Specific user:', specificUser);
    
    // UPDATE
    const updatedUser = await db.update('users', user1.id, {
      age: 31,
      email: 'john.doe@example.com'
    });
    console.log('Updated user:', updatedUser);
    
    // DELETE
    const deletedProduct = await db.delete('products', product1.id);
    console.log('Deleted product:', deletedProduct);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('Database stats:', stats);
    
  } catch (error) {
    console.error('Error in basic example:', error.message);
  }
}

// Example 2: ACID compliance and encryption
async function acidComplianceExample() {
  console.log('\n=== ACID Compliance and Encryption Example ===');
  
  // Initialize database with encryption
  const db = new GitJsonDB({
    encryptionKey: 'my-secret-key-123',
    autoBackup: true,
    repoPath: './secure-data'
  });
  
  try {
    // Create sensitive data
    const sensitiveData = await db.create('passwords', {
      service: 'email',
      username: 'user@example.com',
      password: 'encrypted-password-here'
    });
    console.log('Created encrypted record:', sensitiveData);
    
    // Read the encrypted data
    const retrievedData = await db.readById('passwords', sensitiveData.id);
    console.log('Retrieved encrypted record:', retrievedData);
    
    // Bulk operations (atomic)
    const bulkResults = await db.bulkOperation([
      {
        type: 'create',
        collection: 'users',
        item: { name: 'Bulk User 1', email: 'bulk1@example.com' }
      },
      {
        type: 'create',
        collection: 'users',
        item: { name: 'Bulk User 2', email: 'bulk2@example.com' }
      },
      {
        type: 'update',
        collection: 'passwords',
        id: sensitiveData.id,
        updates: { lastAccessed: new Date().toISOString() }
      }
    ]);
    console.log('Bulk operation results:', bulkResults);
    
  } catch (error) {
    console.error('Error in ACID compliance example:', error.message);
  }
}

// Example 3: Advanced querying and data management
async function advancedExample() {
  console.log('\n=== Advanced Features Example ===');
  
  const db = new GitJsonDB({
    repoPath: './advanced-data',
    maxRetries: 5,
    retryDelay: 500
  });
  
  try {
    // Create sample data
    const orders = [];
    for (let i = 1; i <= 10; i++) {
      const order = await db.create('orders', {
        orderNumber: `ORD-${i.toString().padStart(3, '0')}`,
        customerId: `CUST-${Math.floor(Math.random() * 5) + 1}`,
        amount: Math.floor(Math.random() * 1000) + 100,
        status: ['pending', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
        items: [
          { productId: 'PROD-1', quantity: Math.floor(Math.random() * 5) + 1 },
          { productId: 'PROD-2', quantity: Math.floor(Math.random() * 3) + 1 }
        ]
      });
      orders.push(order);
    }
    
    // Advanced queries using functions
    const highValueOrders = await db.read('orders', {
      amount: (amount) => amount > 500
    });
    console.log('High value orders (>$500):', highValueOrders.length);
    
    const pendingOrders = await db.read('orders', { status: 'pending' });
    console.log('Pending orders:', pendingOrders.length);
    
    // Export data
    const exportPath = await db.export('./exported-data.json');
    console.log('Data exported to:', exportPath);
    
    // Import data to new collection
    const importDb = new GitJsonDB({ repoPath: './imported-data' });
    await importDb.import('./exported-data.json');
    console.log('Data imported successfully');
    
  } catch (error) {
    console.error('Error in advanced example:', error.message);
  }
}

// Example 4: Error handling and recovery
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');
  
  const db = new GitJsonDB({
    repoPath: './error-test-data',
    maxRetries: 3
  });
  
  try {
    // Try to read from non-existent collection
    const nonExistent = await db.read('non-existent');
    console.log('Non-existent collection result:', nonExistent);
    
    // Try to update non-existent item
    try {
      await db.update('users', 'non-existent-id', { name: 'Test' });
    } catch (error) {
      console.log('Expected error for non-existent item:', error.message);
    }
    
    // Try to delete non-existent collection
    try {
      await db.deleteCollection('non-existent-collection');
    } catch (error) {
      console.log('Expected error for non-existent collection:', error.message);
    }
    
    // Create and then delete collection
    await db.create('temp-collection', { test: 'data' });
    const deletedCollection = await db.deleteCollection('temp-collection');
    console.log('Deleted collection items:', deletedCollection.length);
    
  } catch (error) {
    console.error('Error in error handling example:', error.message);
  }
}

// Example 5: Frontend integration simulation
async function frontendIntegrationExample() {
  console.log('\n=== Frontend Integration Example ===');
  
  const db = new GitJsonDB({
    repoPath: './frontend-data',
    autoBackup: true
  });
  
  try {
    // Simulate form submission from frontend
    const handleFormSubmission = async (formData) => {
      const newUser = await db.create('users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        submittedAt: new Date().toISOString()
      });
      return newUser;
    };
    
    // Simulate user registration
    const registrationResult = await handleFormSubmission({
      name: 'Frontend User',
      email: 'frontend@example.com',
      phone: '+1-555-0123'
    });
    console.log('User registered:', registrationResult);
    
    // Simulate user profile update
    const updateProfile = async (userId, updates) => {
      return await db.update('users', userId, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    };
    
    const updatedUser = await updateProfile(registrationResult.id, {
      phone: '+1-555-0456',
      preferences: { theme: 'dark', notifications: true }
    });
    console.log('Profile updated:', updatedUser);
    
    // Simulate data retrieval for frontend display
    const getUsersForDisplay = async () => {
      const users = await db.read('users');
      return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }));
    };
    
    const displayUsers = await getUsersForDisplay();
    console.log('Users for frontend display:', displayUsers);
    
  } catch (error) {
    console.error('Error in frontend integration example:', error.message);
  }
}

// Run all examples
async function runAllExamples() {
  try {
    await basicExample();
    await acidComplianceExample();
    await advancedExample();
    await errorHandlingExample();
    await frontendIntegrationExample();
    
    console.log('\n=== All examples completed successfully! ===');
  } catch (error) {
    console.error('Error running examples:', error.message);
  }
}

// Export functions for individual testing
module.exports = {
  basicExample,
  acidComplianceExample,
  advancedExample,
  errorHandlingExample,
  frontendIntegrationExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
} 