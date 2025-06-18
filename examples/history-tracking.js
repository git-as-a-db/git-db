/**
 * GitDB History Tracking Example
 * Demonstrates how to use GitDB's history tracking features with GitHub storage
 */

const GitDB = require('../src/index');

async function historyTrackingExample() {
  console.log('🚀 GitDB History Tracking Example\n');

  // Check if GitHub token is available
  if (!process.env.GITHUB_TOKEN) {
    console.log('❌ GitHub token not found. Set GITHUB_TOKEN environment variable to run this example.');
    console.log('   This example requires GitHub storage to demonstrate history tracking.');
    return;
  }

  const db = new GitDB({
    storageType: 'github',
    format: 'json',
    owner: 'git-as-a-db',
    repo: 'your-repo',
    path: 'data/history-example.json',
    token: process.env.GITHUB_TOKEN,
    autoBackup: true
  });

  try {
    await db.initialize();
    console.log('✅ Database initialized with history tracking');

    // Check if history tracking is available
    if (!db.hasHistoryTracking()) {
      console.log('❌ History tracking is not available for this storage type');
      return;
    }

    // Create some sample data to demonstrate history
    console.log('\n📝 Creating sample data...');
    
    const user1 = await db.create('users', {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      age: 28,
      department: 'Engineering',
      salary: 75000
    }, 'Add Alice Johnson to users');

    const user2 = await db.create('users', {
      name: 'Bob Smith',
      email: 'bob@example.com',
      age: 32,
      department: 'Marketing',
      salary: 65000
    }, 'Add Bob Smith to users');

    const user3 = await db.create('users', {
      name: 'Carol Davis',
      email: 'carol@example.com',
      age: 25,
      department: 'Engineering',
      salary: 70000
    }, 'Add Carol Davis to users');

    console.log('✅ Created 3 users');

    // Update a user to create more history
    console.log('\n✏️  Updating user data...');
    await db.update('users', user1.id, {
      age: 29,
      salary: 78000
    }, 'Update Alice: age and salary increase');

    await db.update('users', user2.id, {
      department: 'Sales',
      salary: 70000
    }, 'Transfer Bob to Sales department');

    // Delete a user
    console.log('\n🗑️  Deleting a user...');
    await db.delete('users', user3.id, 'Remove Carol Davis from users');

    // Now demonstrate history tracking features
    console.log('\n📊 ===== HISTORY TRACKING DEMONSTRATION =====');

    // 1. Get commit history
    console.log('\n1️⃣  Getting commit history...');
    const commits = await db.getCommitHistory(10);
    console.log(`📋 Found ${commits.length} commits:`);
    commits.forEach((commit, index) => {
      console.log(`   ${index + 1}. ${commit.message} (${commit.author.name})`);
    });

    // 2. Get history statistics
    console.log('\n2️⃣  Getting history statistics...');
    const stats = await db.getHistoryStats();
    console.log('📈 History Statistics:');
    console.log(`   Total commits: ${stats.totalCommits}`);
    console.log(`   Authors: ${stats.authors.join(', ')}`);
    console.log(`   Average commits per day: ${stats.averageCommitsPerDay}`);
    console.log(`   First commit: ${stats.firstCommit?.message}`);
    console.log(`   Last commit: ${stats.lastCommit?.message}`);

    // 3. Get record history for a specific user
    console.log('\n3️⃣  Getting record history for Alice...');
    const aliceHistory = await db.getRecordHistory('users', user1.id, 20);
    console.log(`📜 Alice's history (${aliceHistory.length} entries):`);
    aliceHistory.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.action.toUpperCase()} - ${entry.message} (${entry.author.name})`);
      if (entry.action === 'updated') {
        console.log(`      Age: ${entry.record.age}, Salary: $${entry.record.salary}`);
      }
    });

    // 4. Get field history for a specific field
    console.log('\n4️⃣  Getting salary history for Alice...');
    const salaryHistory = await db.getFieldHistory('users', user1.id, 'salary', 10);
    console.log('💰 Salary history:');
    salaryHistory.forEach((entry, index) => {
      console.log(`   ${index + 1}. $${entry.fieldValue} (${entry.action}) - ${entry.message}`);
    });

    // 5. Search history by criteria
    console.log('\n5️⃣  Searching history by author...');
    const authorCommits = await db.searchHistory({ 
      author: commits[0].author.name 
    });
    console.log(`🔍 Found ${authorCommits.length} commits by ${commits[0].author.name}`);

    // 6. Get collection timeline
    console.log('\n6️⃣  Getting users collection timeline...');
    const timeline = await db.getCollectionTimeline('users', 10);
    console.log('📅 Collection timeline:');
    timeline.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.recordCount} users - ${entry.message} (${entry.author.name})`);
    });

    // 7. Get changes in a specific commit
    console.log('\n7️⃣  Getting changes in the last commit...');
    if (commits.length > 0) {
      const changes = await db.getCommitChanges(commits[0].sha);
      console.log('🔄 Changes in last commit:');
      
      Object.entries(changes.added).forEach(([collection, items]) => {
        if (items.length > 0) {
          console.log(`   Added to ${collection}: ${items.length} items`);
        }
      });
      
      Object.entries(changes.modified).forEach(([collection, items]) => {
        if (items.length > 0) {
          console.log(`   Modified in ${collection}: ${items.length} items`);
        }
      });
      
      Object.entries(changes.deleted).forEach(([collection, items]) => {
        if (items.length > 0) {
          console.log(`   Deleted from ${collection}: ${items.length} items`);
        }
      });
    }

    // 8. Get file content at a specific commit
    console.log('\n8️⃣  Getting file content at first commit...');
    if (commits.length > 1) {
      const fileData = await db.getFileAtCommit(commits[commits.length - 1].sha);
      console.log(`📄 File at first commit (${fileData.size} bytes):`);
      const data = JSON.parse(fileData.content);
      console.log(`   Collections: ${Object.keys(data).join(', ')}`);
      Object.entries(data).forEach(([collection, items]) => {
        console.log(`   ${collection}: ${items.length} items`);
      });
    }

    // 9. Get diff between two commits
    console.log('\n9️⃣  Getting diff between first and last commit...');
    if (commits.length > 1) {
      const diff = await db.getDiff(commits[commits.length - 1].sha, commits[0].sha);
      console.log('🔍 Diff information:');
      console.log(`   Commits ahead: ${diff.ahead_by}`);
      console.log(`   Commits behind: ${diff.behind_by}`);
      console.log(`   Total commits: ${diff.total_commits}`);
      console.log(`   Files changed: ${diff.files.length}`);
      
      diff.files.forEach(file => {
        console.log(`   📁 ${file.filename}: ${file.status} (+${file.additions} -${file.deletions})`);
      });
    }

    console.log('\n✅ History tracking demonstration completed!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('   • Complete commit history tracking');
    console.log('   • Record-level history with action detection');
    console.log('   • Field-level change tracking');
    console.log('   • History search and filtering');
    console.log('   • Collection timeline analysis');
    console.log('   • Commit change analysis');
    console.log('   • File version comparison');
    console.log('   • History statistics and metrics');

  } catch (error) {
    console.error('❌ Error in history tracking example:', error.message);
  } finally {
    await db.close();
    console.log('\n🔒 Database closed');
  }
}

// API endpoint example for history tracking
function createHistoryAPIEndpoints(app, db) {
  // Get commit history
  app.get('/api/history/commits', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const commits = await db.getCommitHistory(limit);
      res.json(commits);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get record history
  app.get('/api/history/record/:collection/:id', async (req, res) => {
    try {
      const { collection, id } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const history = await db.getRecordHistory(collection, id, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get field history
  app.get('/api/history/field/:collection/:id/:field', async (req, res) => {
    try {
      const { collection, id, field } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const history = await db.getFieldHistory(collection, id, field, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search history
  app.get('/api/history/search', async (req, res) => {
    try {
      const { author, since, until, message } = req.query;
      const results = await db.searchHistory({ author, since, until, message });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get history statistics
  app.get('/api/history/stats', async (req, res) => {
    try {
      const stats = await db.getHistoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revert to commit
  app.post('/api/history/revert/:sha', async (req, res) => {
    try {
      const { sha } = req.params;
      const { message } = req.body;
      const result = await db.revertToCommit(sha, message);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Run the example
if (require.main === module) {
  historyTrackingExample().catch(console.error);
}

module.exports = { historyTrackingExample, createHistoryAPIEndpoints }; 