/**
 * GitDB Example - Demonstrates all supported formats and storage types
 * Supports: JSON, CSV, YAML, XML with Local and GitHub storage
 */

const GitDB = require('./src/index.js');

// Example 1: JSON format with local storage
async function jsonLocalExample() {
  console.log('=== JSON Format with Local Storage ===');
  
  const db = new GitDB({
    storageType: 'local',
    format: 'json',
    repoPath: './data-json',
    dataFile: 'database.json',
    encryptionKey: 'json-secret-key'
  });
  
  try {
    await db.initialize();
    
    // CREATE - Add users
    const user1 = await db.create('users', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    console.log('Created JSON user:', user1);
    
    const user2 = await db.create('users', {
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25
    });
    console.log('Created JSON user:', user2);
    
    // READ - Get all users
    const allUsers = await db.read('users');
    console.log('All JSON users:', allUsers);
    
    // UPDATE
    const updatedUser = await db.update('users', user1.id, {
      age: 31,
      email: 'john.doe@example.com'
    });
    console.log('Updated JSON user:', updatedUser);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('JSON database stats:', stats);
    
  } catch (error) {
    console.error('Error in JSON local example:', error.message);
  }
}

// Example 2: CSV format with local storage
async function csvLocalExample() {
  console.log('\n=== CSV Format with Local Storage ===');
  
  const db = new GitDB({
    storageType: 'local',
    format: 'csv',
    repoPath: './data-csv',
    dataFile: 'database.csv',
    csvOptions: {
      headers: true,
      delimiter: ','
    }
  });
  
  try {
    await db.initialize();
    
    // CREATE - Add users (CSV format stores as array of objects)
    const user1 = await db.create('users', {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      age: 28
    });
    console.log('Created CSV user:', user1);
    
    const user2 = await db.create('users', {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      age: 35
    });
    console.log('Created CSV user:', user2);
    
    // READ - Get all users
    const allUsers = await db.read('users');
    console.log('All CSV users:', allUsers);
    
    // UPDATE
    const updatedUser = await db.update('users', user1.id, {
      age: 29,
      email: 'alice.johnson@example.com'
    });
    console.log('Updated CSV user:', updatedUser);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('CSV database stats:', stats);
    
  } catch (error) {
    console.error('Error in CSV local example:', error.message);
  }
}

// Example 3: YAML format with local storage
async function yamlLocalExample() {
  console.log('\n=== YAML Format with Local Storage ===');
  
  const db = new GitDB({
    storageType: 'local',
    format: 'yaml',
    repoPath: './data-yaml',
    dataFile: 'database.yaml',
    encryptionKey: 'yaml-secret-key'
  });
  
  try {
    await db.initialize();
    
    // CREATE - Add users
    const user1 = await db.create('users', {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      age: 32
    });
    console.log('Created YAML user:', user1);
    
    const user2 = await db.create('users', {
      name: 'Diana Prince',
      email: 'diana@example.com',
      age: 27
    });
    console.log('Created YAML user:', user2);
    
    // CREATE - Add products
    const product1 = await db.create('products', {
      name: 'Laptop',
      price: 999.99,
      category: 'electronics'
    });
    console.log('Created YAML product:', product1);
    
    // READ - Get all users
    const allUsers = await db.read('users');
    console.log('All YAML users:', allUsers);
    
    // READ - Get all products
    const allProducts = await db.read('products');
    console.log('All YAML products:', allProducts);
    
    // UPDATE
    const updatedUser = await db.update('users', user1.id, {
      age: 33,
      email: 'charlie.brown@example.com'
    });
    console.log('Updated YAML user:', updatedUser);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('YAML database stats:', stats);
    
  } catch (error) {
    console.error('Error in YAML local example:', error.message);
  }
}

// Example 4: XML format with local storage
async function xmlLocalExample() {
  console.log('\n=== XML Format with Local Storage ===');
  
  const db = new GitDB({
    storageType: 'local',
    format: 'xml',
    repoPath: './data-xml',
    dataFile: 'database.xml',
    xmlOptions: {
      rootName: 'database',
      itemName: 'item',
      collectionName: 'collection'
    }
  });
  
  try {
    await db.initialize();
    
    // CREATE - Add users
    const user1 = await db.create('users', {
      name: 'Eve Adams',
      email: 'eve@example.com',
      age: 29
    });
    console.log('Created XML user:', user1);
    
    const user2 = await db.create('users', {
      name: 'Frank Miller',
      email: 'frank@example.com',
      age: 34
    });
    console.log('Created XML user:', user2);
    
    // CREATE - Add products
    const product1 = await db.create('products', {
      name: 'Smartphone',
      price: 699.99,
      category: 'electronics'
    });
    console.log('Created XML product:', product1);
    
    // READ - Get all users
    const allUsers = await db.read('users');
    console.log('All XML users:', allUsers);
    
    // READ - Get all products
    const allProducts = await db.read('products');
    console.log('All XML products:', allProducts);
    
    // UPDATE
    const updatedUser = await db.update('users', user1.id, {
      age: 30,
      email: 'eve.adams@example.com'
    });
    console.log('Updated XML user:', updatedUser);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('XML database stats:', stats);
    
  } catch (error) {
    console.error('Error in XML local example:', error.message);
  }
}

// Example 5: GitHub storage with JSON format
async function githubJsonExample() {
  console.log('\n=== GitHub Storage with JSON Format ===');
  
  // Check if GitHub token is available
  if (!process.env.GITHUB_TOKEN) {
    console.log('GitHub token not found. Skipping GitHub example.');
    return;
  }
  
  const db = new GitDB({
    storageType: 'github',
    format: 'json',
    owner: 'your-github-username',
    repo: 'your-repo-name',
    path: 'data/gitdb-example.json',
    token: process.env.GITHUB_TOKEN,
    encryptionKey: 'github-secret-key'
  });
  
  try {
    await db.initialize();
    
    // CREATE - Add users (creates commits in GitHub)
    const user1 = await db.create('users', {
      name: 'GitHub User 1',
      email: 'github1@example.com',
      age: 30
    }, 'Add GitHub user 1');
    console.log('Created GitHub user:', user1);
    
    const user2 = await db.create('users', {
      name: 'GitHub User 2',
      email: 'github2@example.com',
      age: 25
    }, 'Add GitHub user 2');
    console.log('Created GitHub user:', user2);
    
    // READ - Get all users
    const allUsers = await db.read('users');
    console.log('All GitHub users:', allUsers);
    
    // UPDATE - Creates a commit
    const updatedUser = await db.update('users', user1.id, {
      age: 31,
      email: 'github1.updated@example.com'
    }, 'Update GitHub user 1');
    console.log('Updated GitHub user:', updatedUser);
    
    // Get commit history
    const history = await db.getCommitHistory(5);
    console.log('Recent GitHub commits:', history);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('GitHub database stats:', stats);
    
  } catch (error) {
    console.error('Error in GitHub JSON example:', error.message);
  }
}

// Example 6: Format conversion
async function formatConversionExample() {
  console.log('\n=== Format Conversion Example ===');
  
  try {
    // Start with JSON format
    const jsonDb = new GitDB({
      storageType: 'local',
      format: 'json',
      repoPath: './data-convert',
      dataFile: 'database.json'
    });
    
    await jsonDb.initialize();
    
    // Add some data
    await jsonDb.create('users', {
      name: 'Convert User',
      email: 'convert@example.com',
      age: 30
    });
    
    await jsonDb.create('products', {
      name: 'Convert Product',
      price: 199.99,
      category: 'test'
    });
    
    console.log('Created data in JSON format');
    
    // Convert to YAML
    const yamlDb = await jsonDb.convertFormat('yaml', {
      repoPath: './data-convert',
      dataFile: 'database.yaml'
    });
    
    console.log('Converted to YAML format');
    
    // Convert to CSV
    const csvDb = await jsonDb.convertFormat('csv', {
      repoPath: './data-convert',
      dataFile: 'database.csv'
    });
    
    console.log('Converted to CSV format');
    
    // Convert to XML
    const xmlDb = await jsonDb.convertFormat('xml', {
      repoPath: './data-convert',
      dataFile: 'database.xml'
    });
    
    console.log('Converted to XML format');
    
    // Show statistics for all formats
    const jsonStats = await jsonDb.getStats();
    const yamlStats = await yamlDb.getStats();
    const csvStats = await csvDb.getStats();
    const xmlStats = await xmlDb.getStats();
    
    console.log('JSON stats:', jsonStats);
    console.log('YAML stats:', yamlStats);
    console.log('CSV stats:', csvStats);
    console.log('XML stats:', xmlStats);
    
  } catch (error) {
    console.error('Error in format conversion example:', error.message);
  }
}

// Example 7: Bulk operations with different formats
async function bulkOperationsExample() {
  console.log('\n=== Bulk Operations Example ===');
  
  const db = new GitDB({
    storageType: 'local',
    format: 'json',
    repoPath: './data-bulk',
    dataFile: 'database.json'
  });
  
  try {
    await db.initialize();
    
    // Perform bulk operations
    const bulkResults = await db.bulkOperation([
      {
        type: 'create',
        collection: 'users',
        item: { name: 'Bulk User 1', email: 'bulk1@example.com', age: 25 }
      },
      {
        type: 'create',
        collection: 'users',
        item: { name: 'Bulk User 2', email: 'bulk2@example.com', age: 30 }
      },
      {
        type: 'create',
        collection: 'products',
        item: { name: 'Bulk Product 1', price: 299.99, category: 'electronics' }
      },
      {
        type: 'create',
        collection: 'products',
        item: { name: 'Bulk Product 2', price: 399.99, category: 'books' }
      }
    ], 'Bulk import: Add multiple users and products');
    
    console.log('Bulk operation results:', bulkResults);
    
    // Get statistics
    const stats = await db.getStats();
    console.log('Bulk operations stats:', stats);
    
  } catch (error) {
    console.error('Error in bulk operations example:', error.message);
  }
}

// Example 8: Error handling and validation
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');
  
  const db = new GitDB({
    storageType: 'local',
    format: 'json',
    repoPath: './data-error',
    dataFile: 'database.json'
  });
  
  try {
    await db.initialize();
    
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

// Setup instructions
function showSetupInstructions() {
  console.log('\n=== Setup Instructions ===');
  console.log('1. Install optional dependencies for different formats:');
  console.log('   npm install js-yaml csv-parser csv-stringify xml2js @octokit/rest');
  console.log('');
  console.log('2. For GitHub storage, create a GitHub Personal Access Token:');
  console.log('   - Go to GitHub Settings > Developer settings > Personal access tokens');
  console.log('   - Generate a new token with "repo" scope');
  console.log('   - Set it as environment variable: export GITHUB_TOKEN="your-token"');
  console.log('');
  console.log('3. Update GitHub configuration in the examples:');
  console.log('   - owner: your GitHub username or organization');
  console.log('   - repo: your repository name');
  console.log('   - path: path to file in the repository');
  console.log('');
  console.log('4. Run the examples:');
  console.log('   node gitdb-example.js');
}

// Run all examples
async function runAllExamples() {
  try {
    await jsonLocalExample();
    await csvLocalExample();
    await yamlLocalExample();
    await xmlLocalExample();
    await githubJsonExample();
    await formatConversionExample();
    await bulkOperationsExample();
    await errorHandlingExample();
    
    console.log('\n=== All GitDB examples completed successfully! ===');
    console.log('Check the generated files in the data directories.');
    
  } catch (error) {
    console.error('Error running examples:', error.message);
    showSetupInstructions();
  }
}

// Export functions for individual testing
module.exports = {
  jsonLocalExample,
  csvLocalExample,
  yamlLocalExample,
  xmlLocalExample,
  githubJsonExample,
  formatConversionExample,
  bulkOperationsExample,
  errorHandlingExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

async function demonstrateAdvancedFiltering() {
  console.log('🚀 GitDB Advanced Filtering Demo\n');

  // Initialize database with local storage and JSON format
  const db = new GitDB({
    storageType: 'local',
    format: 'json',
    repoPath: './data',
    dataFile: 'advanced-demo.json'
  });

  // Initialize the database
  await db.initialize();

  // Sample data for demonstration
  const sampleData = {
    users: [
      { id: '1', name: 'Alice Johnson', age: 28, email: 'alice@example.com', department: 'Engineering', salary: 75000, active: true },
      { id: '2', name: 'Bob Smith', age: 32, email: 'bob@example.com', department: 'Marketing', salary: 65000, active: true },
      { id: '3', name: 'Carol Davis', age: 25, email: 'carol@example.com', department: 'Engineering', salary: 70000, active: false },
      { id: '4', name: 'David Wilson', age: 35, email: 'david@example.com', department: 'Sales', salary: 80000, active: true },
      { id: '5', name: 'Eve Brown', age: 29, email: 'eve@example.com', department: 'Marketing', salary: 60000, active: true },
      { id: '6', name: 'Frank Miller', age: 41, email: 'frank@example.com', department: 'Engineering', salary: 90000, active: true },
      { id: '7', name: 'Grace Lee', age: 27, email: 'grace@example.com', department: 'Sales', salary: 72000, active: false },
      { id: '8', name: 'Henry Taylor', age: 33, email: 'henry@example.com', department: 'Engineering', salary: 85000, active: true }
    ],
    orders: [
      { id: '1', userId: '1', product: 'Laptop', amount: 1200, date: '2024-01-15', status: 'completed' },
      { id: '2', userId: '2', product: 'Mouse', amount: 50, date: '2024-01-16', status: 'pending' },
      { id: '3', userId: '1', product: 'Keyboard', amount: 120, date: '2024-01-17', status: 'completed' },
      { id: '4', userId: '3', product: 'Monitor', amount: 300, date: '2024-01-18', status: 'cancelled' },
      { id: '5', userId: '4', product: 'Headphones', amount: 200, date: '2024-01-19', status: 'completed' },
      { id: '6', userId: '2', product: 'Tablet', amount: 500, date: '2024-01-20', status: 'pending' },
      { id: '7', userId: '5', product: 'Phone', amount: 800, date: '2024-01-21', status: 'completed' },
      { id: '8', userId: '6', product: 'Speaker', amount: 150, date: '2024-01-22', status: 'completed' }
    ]
  };

  // Populate database with sample data
  console.log('📊 Populating database with sample data...');
  for (const [collection, items] of Object.entries(sampleData)) {
    for (const item of items) {
      await db.create(collection, item);
    }
  }

  console.log('✅ Database populated successfully!\n');

  // ===== FUNCTIONAL PROGRAMMING METHODS =====
  console.log('🔄 FUNCTIONAL PROGRAMMING METHODS');
  console.log('=====================================');

  // MAP - Transform data
  console.log('\n1. MAP - Transform user names to uppercase:');
  const upperNames = await db.map('users', user => ({
    ...user,
    name: user.name.toUpperCase()
  }));
  console.log(upperNames.slice(0, 3));

  // FILTER - Filter active users
  console.log('\n2. FILTER - Active users only:');
  const activeUsers = await db.filter('users', user => user.active);
  console.log(`Found ${activeUsers.length} active users`);

  // FIND - Find first user with specific criteria
  console.log('\n3. FIND - First user in Engineering department:');
  const firstEngineer = await db.find('users', user => user.department === 'Engineering');
  console.log(firstEngineer);

  // REDUCE - Calculate total salary
  console.log('\n4. REDUCE - Total salary of all users:');
  const totalSalary = await db.reduce('users', (sum, user) => sum + user.salary, 0);
  console.log(`Total salary: $${totalSalary.toLocaleString()}`);

  // SORT - Sort users by age
  console.log('\n5. SORT - Users sorted by age (descending):');
  const sortedByAge = await db.sort('users', 'age', 'desc');
  console.log(sortedByAge.slice(0, 3).map(u => `${u.name} (${u.age})`));

  // GROUP BY - Group users by department
  console.log('\n6. GROUP BY - Users grouped by department:');
  const groupedByDept = await db.groupBy('users', 'department');
  Object.entries(groupedByDept).forEach(([dept, users]) => {
    console.log(`${dept}: ${users.length} users`);
  });

  // ===== AGGREGATION METHODS =====
  console.log('\n📈 AGGREGATION METHODS');
  console.log('========================');

  // COUNT
  console.log('\n1. COUNT - Total users:', await db.count('users'));
  console.log('   Active users:', await db.count('users', user => user.active));

  // SUM
  console.log('\n2. SUM - Total salary:', await db.sum('users', 'salary'));

  // AVERAGE
  console.log('\n3. AVERAGE - Average age:', await db.average('users', 'age'));
  console.log('   Average salary:', await db.average('users', 'salary'));

  // MIN/MAX
  console.log('\n4. MIN/MAX - Age range:', {
    min: await db.min('users', 'age'),
    max: await db.max('users', 'age')
  });

  // DISTINCT
  console.log('\n5. DISTINCT - Departments:', await db.distinct('users', 'department'));

  // ===== SQL-LIKE QUERY METHODS =====
  console.log('\n🗃️ SQL-LIKE QUERY METHODS');
  console.log('============================');

  // SELECT with WHERE
  console.log('\n1. SELECT with WHERE - Users in Engineering with salary > 70000:');
  const highPaidEngineers = await db.select('users', {
    where: {
      department: 'Engineering',
      salary: { operator: 'gt', value: 70000 }
    },
    fields: ['name', 'salary', 'department']
  });
  console.log(highPaidEngineers);

  // Complex WHERE conditions
  console.log('\n2. Complex WHERE - Active users aged 25-35:');
  const youngActiveUsers = await db.where('users', {
    age: { operator: 'gte', value: 25 },
    active: true
  });
  console.log(youngActiveUsers.filter(u => u.age <= 35).map(u => `${u.name} (${u.age})`));

  // SELECT with ORDER BY and LIMIT
  console.log('\n3. SELECT with ORDER BY and LIMIT - Top 3 highest paid users:');
  const topEarners = await db.select('users', {
    orderBy: ['salary', 'desc'],
    limit: 3,
    fields: ['name', 'salary']
  });
  console.log(topEarners);

  // LIKE operator
  console.log('\n4. LIKE operator - Users with "john" in name:');
  const johnUsers = await db.where('users', {
    name: { operator: 'like', value: 'john' }
  });
  console.log(johnUsers.map(u => u.name));

  // IN operator
  console.log('\n5. IN operator - Users in specific departments:');
  const deptUsers = await db.where('users', {
    department: { operator: 'in', value: ['Engineering', 'Marketing'] }
  });
  console.log(deptUsers.map(u => `${u.name} (${u.department})`));

  // ===== JOIN OPERATIONS =====
  console.log('\n🔗 JOIN OPERATIONS');
  console.log('===================');

  // INNER JOIN
  console.log('\n1. INNER JOIN - Users with their orders:');
  const userOrders = await db.join('users', 'orders', 'id', 'userId', 'inner');
  console.log(`Found ${userOrders.length} user-order combinations`);
  console.log('Sample:', userOrders[0]);

  // LEFT JOIN
  console.log('\n2. LEFT JOIN - All users with their orders (including users with no orders):');
  const allUserOrders = await db.join('users', 'orders', 'id', 'userId', 'left');
  const usersWithNoOrders = allUserOrders.filter(uo => !uo.orders);
  console.log(`Users with no orders: ${usersWithNoOrders.length}`);

  // ===== AGGREGATION PIPELINE =====
  console.log('\n🔧 AGGREGATION PIPELINE');
  console.log('=========================');

  // Complex aggregation
  console.log('\n1. Aggregation Pipeline - Department statistics:');
  const deptStats = await db.aggregate('users', [
    {
      type: 'group',
      groupBy: ['department'],
      aggregations: [
        { name: 'count', type: 'count', field: 'id' },
        { name: 'avgSalary', type: 'avg', field: 'salary' },
        { name: 'minAge', type: 'min', field: 'age' },
        { name: 'maxAge', type: 'max', field: 'age' }
      ]
    },
    {
      type: 'sort',
      sort: { avgSalary: -1 }
    }
  ]);
  console.log(deptStats);

  // Filtered aggregation
  console.log('\n2. Filtered Aggregation - Active users by department:');
  const activeDeptStats = await db.aggregate('users', [
    {
      type: 'match',
      conditions: { active: true }
    },
    {
      type: 'group',
      groupBy: ['department'],
      aggregations: [
        { name: 'count', type: 'count', field: 'id' },
        { name: 'avgSalary', type: 'avg', field: 'salary' }
      ]
    }
  ]);
  console.log(activeDeptStats);

  // ===== ADVANCED FILTERING EXAMPLES =====
  console.log('\n🎯 ADVANCED FILTERING EXAMPLES');
  console.log('================================');

  // Custom predicate functions
  console.log('\n1. Custom predicate - Users with email domains:');
  const gmailUsers = await db.filter('users', user => user.email.includes('gmail'));
  console.log(`Gmail users: ${gmailUsers.length}`);

  // Complex filtering with multiple conditions
  console.log('\n2. Complex filtering - Senior engineers:');
  const seniorEngineers = await db.filter('users', user => 
    user.department === 'Engineering' && 
    user.age >= 30 && 
    user.salary >= 80000
  );
  console.log('Senior engineers:', seniorEngineers.map(u => `${u.name} (${u.age}, $${u.salary})`));

  // Chaining operations
  console.log('\n3. Chaining operations - Process data pipeline:');
  const processedData = await db
    .filter('users', user => user.active)
    .then(users => users.map(user => ({
      ...user,
      salaryBand: user.salary >= 80000 ? 'High' : user.salary >= 65000 ? 'Medium' : 'Low'
    })))
    .then(users => users.filter(user => user.salaryBand === 'High'));
  
  console.log('High-earning active users:', processedData.map(u => `${u.name} (${u.salaryBand})`));

  // ===== PERFORMANCE DEMONSTRATION =====
  console.log('\n⚡ PERFORMANCE DEMONSTRATION');
  console.log('=============================');

  // Measure query performance
  console.log('\n1. Query performance comparison:');
  
  const startTime = Date.now();
  const allUsers = await db.read('users');
  const readTime = Date.now() - startTime;
  
  const filterStart = Date.now();
  const filteredUsers = await db.filter('users', user => user.active);
  const filterTime = Date.now() - filterStart;
  
  const selectStart = Date.now();
  const selectedUsers = await db.select('users', {
    where: { active: true },
    fields: ['name', 'department']
  });
  const selectTime = Date.now() - selectStart;
  
  console.log(`- Read all users: ${readTime}ms`);
  console.log(`- Filter active users: ${filterTime}ms`);
  console.log(`- Select active users: ${selectTime}ms`);

  // ===== STATISTICS =====
  console.log('\n📊 DATABASE STATISTICS');
  console.log('=======================');
  
  const stats = await db.getStats();
  console.log(stats);

  console.log('\n✅ Advanced filtering demonstration completed!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('• Functional programming methods (map, reduce, filter, find)');
  console.log('• SQL-like query syntax with WHERE, ORDER BY, LIMIT');
  console.log('• Advanced operators (eq, gt, lt, in, like, regex)');
  console.log('• JOIN operations (inner, left, right)');
  console.log('• Aggregation pipeline with grouping and calculations');
  console.log('• Performance optimization and statistics');
}

// Run the demonstration
demonstrateAdvancedFiltering().catch(console.error); 