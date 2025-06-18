/**
 * GitHub JSON Database Example
 * Demonstrates how to use GitJsonDB with GitHub storage
 */

const GitHubJsonDB = require('./github-json-db');

// Example 1: Basic GitHub setup and CRUD operations
async function githubBasicExample() {
  console.log('=== GitHub JSON Database Example ===');
  
  // Initialize database with GitHub configuration
  const db = new GitHubJsonDB({
    owner: 'your-github-username',           // GitHub username or org
    repo: 'your-repo-name',                  // Repository name
    branch: 'main',                          // Branch to use
    path: 'data/database.json',              // Path to JSON file in repo
    token: process.env.GITHUB_TOKEN,         // GitHub Personal Access Token
    encryptionKey: 'your-secret-key',        // Optional encryption
    autoBackup: true                         // Create backup files
  });
  
  try {
    // CREATE - Add users (creates commits in GitHub)
    const user1 = await db.create('users', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    }, 'Add new user: John Doe');
    console.log('Created user:', user1);
    
    const user2 = await db.create('users', {
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25
    }, 'Add new user: Jane Smith');
    console.log('Created user:', user2);
    
    // CREATE - Add products
    const product1 = await db.create('products', {
      name: 'Laptop',
      price: 999.99,
      category: 'electronics'
    }, 'Add new product: Laptop');
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
    
    // UPDATE - Updates the file and creates a commit
    const updatedUser = await db.update('users', user1.id, {
      age: 31,
      email: 'john.doe@example.com'
    }, 'Update user: John Doe age and email');
    console.log('Updated user:', updatedUser);
    
    // DELETE - Removes item and creates a commit
    const deletedProduct = await db.delete('products', product1.id, 'Delete product: Laptop');
    console.log('Deleted product:', deletedProduct);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('Database stats:', stats);
    
    // Get commit history
    const history = await db.getCommitHistory(5);
    console.log('Recent commits:', history);
    
  } catch (error) {
    console.error('Error in GitHub example:', error.message);
  }
}

// Example 2: Bulk operations with GitHub
async function githubBulkExample() {
  console.log('\n=== GitHub Bulk Operations Example ===');
  
  const db = new GitHubJsonDB({
    owner: 'your-github-username',
    repo: 'your-repo-name',
    token: process.env.GITHUB_TOKEN,
    path: 'data/bulk-test.json'
  });
  
  try {
    // Perform multiple operations in a single commit
    const bulkResults = await db.bulkOperation([
      {
        type: 'create',
        collection: 'users',
        item: { name: 'Bulk User 1', email: 'bulk1@example.com', age: 30 }
      },
      {
        type: 'create',
        collection: 'users',
        item: { name: 'Bulk User 2', email: 'bulk2@example.com', age: 25 }
      },
      {
        type: 'create',
        collection: 'products',
        item: { name: 'Bulk Product 1', price: 199.99, category: 'electronics' }
      }
    ], 'Bulk import: Add multiple users and products');
    
    console.log('Bulk operation results:', bulkResults);
    
    // Get the commit history to see the bulk commit
    const history = await db.getCommitHistory(3);
    console.log('Commit history after bulk operation:', history);
    
  } catch (error) {
    console.error('Error in bulk example:', error.message);
  }
}

// Example 3: Version control features
async function githubVersionControlExample() {
  console.log('\n=== GitHub Version Control Example ===');
  
  const db = new GitHubJsonDB({
    owner: 'your-github-username',
    repo: 'your-repo-name',
    token: process.env.GITHUB_TOKEN,
    path: 'data/version-test.json'
  });
  
  try {
    // Create initial data
    await db.create('users', {
      name: 'Version User',
      email: 'version@example.com',
      age: 30
    }, 'Initial commit: Add version user');
    
    // Get commit history
    const history = await db.getCommitHistory(10);
    console.log('Commit history:', history);
    
    // Get a specific version (if you have the SHA)
    if (history.length > 0) {
      const firstCommit = history[history.length - 1];
      const versionData = await db.getVersion(firstCommit.sha);
      console.log('Data at first commit:', versionData);
    }
    
  } catch (error) {
    console.error('Error in version control example:', error.message);
  }
}

// Example 4: Frontend integration with GitHub
async function githubFrontendExample() {
  console.log('\n=== GitHub Frontend Integration Example ===');
  
  const db = new GitHubJsonDB({
    owner: 'your-github-username',
    repo: 'your-repo-name',
    token: process.env.GITHUB_TOKEN,
    path: 'data/frontend-data.json'
  });
  
  try {
    // Simulate form submission from frontend
    const handleFormSubmission = async (formData) => {
      const newUser = await db.create('users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        submittedAt: new Date().toISOString()
      }, `Frontend submission: ${formData.name}`);
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
      }, `Profile update: ${updates.name || 'User'}`);
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

// Example 5: Error handling and GitHub-specific considerations
async function githubErrorHandlingExample() {
  console.log('\n=== GitHub Error Handling Example ===');
  
  const db = new GitHubJsonDB({
    owner: 'your-github-username',
    repo: 'your-repo-name',
    token: process.env.GITHUB_TOKEN,
    path: 'data/error-test.json'
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
    await db.create('temp-collection', { test: 'data' }, 'Create temp collection');
    const deletedCollection = await db.deleteCollection('temp-collection', 'Delete temp collection');
    console.log('Deleted collection items:', deletedCollection.length);
    
  } catch (error) {
    console.error('Error in error handling example:', error.message);
  }
}

// Setup instructions
function showSetupInstructions() {
  console.log('\n=== Setup Instructions ===');
  console.log('1. Create a GitHub Personal Access Token:');
  console.log('   - Go to GitHub Settings > Developer settings > Personal access tokens');
  console.log('   - Generate a new token with "repo" scope');
  console.log('   - Set it as environment variable: export GITHUB_TOKEN="your-token"');
  console.log('');
  console.log('2. Create a repository on GitHub');
  console.log('');
  console.log('3. Update the configuration in the examples:');
  console.log('   - owner: your GitHub username or organization');
  console.log('   - repo: your repository name');
  console.log('   - path: path to JSON file in the repository');
  console.log('');
  console.log('4. Install dependencies:');
  console.log('   npm install @octokit/rest');
  console.log('');
  console.log('5. Run the examples:');
  console.log('   node github-example.js');
}

// Run all examples
async function runAllGitHubExamples() {
  try {
    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.log('GitHub token not found. Please set GITHUB_TOKEN environment variable.');
      showSetupInstructions();
      return;
    }
    
    await githubBasicExample();
    await githubBulkExample();
    await githubVersionControlExample();
    await githubFrontendExample();
    await githubErrorHandlingExample();
    
    console.log('\n=== All GitHub examples completed successfully! ===');
    console.log('Check your GitHub repository to see the commits and data changes.');
    
  } catch (error) {
    console.error('Error running GitHub examples:', error.message);
    showSetupInstructions();
  }
}

// Export functions for individual testing
module.exports = {
  githubBasicExample,
  githubBulkExample,
  githubVersionControlExample,
  githubFrontendExample,
  githubErrorHandlingExample,
  runAllGitHubExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllGitHubExamples();
} 