/**
 * Basic usage example for GitDB
 * This demonstrates the core functionality of the package
 */

const GitDB = require('../src/index');

async function basicExample() {
  console.log('🚀 GitDB Basic Usage Example\n');

  // Create a local JSON database
  const db = new GitDB({
    storageType: 'local',
    format: 'json',
    repoPath: './example-data',
    autoBackup: true
  });

  try {
    // Initialize the database
    await db.initialize();
    console.log('✅ Database initialized');

    // Create some sample data
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
    ];

    // Add users to the database
    for (const user of users) {
      await db.create('users', user);
      console.log(`✅ Added user: ${user.name}`);
    }

    // Read all users
    const allUsers = await db.read('users');
    console.log(`\n📖 All users (${allUsers.length}):`);
    allUsers.forEach(user => console.log(`  - ${user.name} (${user.email})`));

    // Filter users by age
    const youngUsers = await db.read('users', { age: age => age < 30 });
    console.log(`\n🔍 Young users (${youngUsers.length}):`);
    youngUsers.forEach(user => console.log(`  - ${user.name} (age: ${user.age})`));

    // Update a user
    await db.update('users', '1', { age: 31 });
    console.log('\n✏️  Updated John\'s age to 31');

    // Read a specific user
    const john = await db.readById('users', '1');
    console.log(`\n👤 John's updated info: ${john.name}, age ${john.age}`);

    // Delete a user
    await db.delete('users', '3');
    console.log('\n🗑️  Deleted Bob Johnson');

    // Final user count
    const finalUsers = await db.read('users');
    console.log(`\n📊 Final user count: ${finalUsers.length}`);

    // Get database statistics
    const stats = await db.getStats();
    console.log('\n📈 Database Statistics:');
    console.log(`  Collections: ${Object.keys(stats.collections).length}`);
    console.log(`  Total records: ${stats.totalRecords}`);
    console.log(`  Storage size: ${stats.storageSize} bytes`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Clean up
    await db.close();
    console.log('\n🔒 Database closed');
  }
}

// Run the example
if (require.main === module) {
  basicExample().catch(console.error);
}

module.exports = basicExample; 