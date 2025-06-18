/**
 * HistoryManager - Provides version history tracking for GitDB
 * Uses GitHub API to track changes to data files and records
 */

class HistoryManager {
  constructor(storage) {
    this.storage = storage;
    this.octokit = storage.octokit;
    this.config = storage.getConfig();
  }

  /**
   * Get complete commit history for a data file
   */
  async getFileHistory(limit = 50) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.path,
        per_page: limit
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        },
        url: commit.html_url,
        parents: commit.parents.map(p => p.sha)
      }));
    } catch (error) {
      throw new Error(`Failed to get file history: ${error.message}`);
    }
  }

  /**
   * Get the content of a data file at a specific commit
   */
  async getFileAtCommit(sha) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.path,
        ref: sha
      });

      if (response.data.type === 'file') {
        const content = Buffer.from(response.data.content, 'base64').toString('utf8');
        return {
          content,
          sha: response.data.sha,
          size: response.data.size,
          commit: sha
        };
      }
      
      throw new Error('Path is not a file');
    } catch (error) {
      throw new Error(`Failed to get file at commit ${sha}: ${error.message}`);
    }
  }

  /**
   * Get the difference between two commits for a data file
   */
  async getDiff(sha1, sha2) {
    try {
      const response = await this.octokit.repos.compareCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        base: sha1,
        head: sha2
      });

      return {
        ahead_by: response.data.ahead_by,
        behind_by: response.data.behind_by,
        total_commits: response.data.total_commits,
        files: response.data.files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get diff between ${sha1} and ${sha2}: ${error.message}`);
    }
  }

  /**
   * Get the history of a specific record by ID
   * Tracks when a record was created, updated, or deleted
   */
  async getRecordHistory(collection, recordId, limit = 50) {
    try {
      // Get commit history for the file
      const commits = await this.getFileHistory(limit);
      const recordHistory = [];

      // For each commit, check if the record exists and what changed
      for (const commit of commits) {
        try {
          const fileData = await this.getFileAtCommit(commit.sha);
          const data = JSON.parse(fileData.content);
          
          if (data[collection]) {
            const record = data[collection].find(item => item.id === recordId);
            if (record) {
              recordHistory.push({
                commit: commit.sha,
                message: commit.message,
                author: commit.author,
                date: commit.author.date,
                record: record,
                action: 'exists'
              });
            }
          }
        } catch (error) {
          // Skip commits where file parsing fails
          console.warn(`Failed to parse file at commit ${commit.sha}: ${error.message}`);
        }
      }

      // Analyze the history to determine actions (create, update, delete)
      return this.analyzeRecordHistory(recordHistory);
    } catch (error) {
      throw new Error(`Failed to get record history: ${error.message}`);
    }
  }

  /**
   * Analyze record history to determine actions
   */
  analyzeRecordHistory(history) {
    if (history.length === 0) return [];

    const analyzed = [];
    
    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const previous = i < history.length - 1 ? history[i + 1] : null;

      if (!previous) {
        // First appearance - likely created
        analyzed.push({
          ...current,
          action: 'created'
        });
      } else {
        // Check if record changed
        const changed = this.hasRecordChanged(current.record, previous.record);
        analyzed.push({
          ...current,
          action: changed ? 'updated' : 'unchanged'
        });
      }
    }

    return analyzed;
  }

  /**
   * Check if a record has changed between two versions
   */
  hasRecordChanged(record1, record2) {
    if (!record1 || !record2) return true;
    
    const keys1 = Object.keys(record1);
    const keys2 = Object.keys(record2);
    
    if (keys1.length !== keys2.length) return true;
    
    for (const key of keys1) {
      if (JSON.stringify(record1[key]) !== JSON.stringify(record2[key])) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Search commit history by author, date range, or commit message
   */
  async searchHistory(options = {}) {
    try {
      const { author, since, until, message } = options;
      
      let response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.path,
        author,
        since,
        until,
        per_page: 100
      });

      let commits = response.data;

      // Filter by commit message if specified
      if (message) {
        commits = commits.filter(commit => 
          commit.commit.message.toLowerCase().includes(message.toLowerCase())
        );
      }

      return commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        url: commit.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to search history: ${error.message}`);
    }
  }

  /**
   * Get statistics about the data file history
   */
  async getHistoryStats() {
    try {
      const commits = await this.getFileHistory(100);
      
      if (commits.length === 0) {
        return {
          totalCommits: 0,
          firstCommit: null,
          lastCommit: null,
          authors: [],
          averageCommitsPerDay: 0
        };
      }

      const authors = [...new Set(commits.map(c => c.author.name))];
      const dates = commits.map(c => new Date(c.author.date));
      const firstCommit = commits[commits.length - 1];
      const lastCommit = commits[0];

      // Calculate average commits per day
      const timeSpan = (lastCommit.author.date - firstCommit.author.date) / (1000 * 60 * 60 * 24);
      const averageCommitsPerDay = timeSpan > 0 ? commits.length / timeSpan : 0;

      return {
        totalCommits: commits.length,
        firstCommit: {
          sha: firstCommit.sha,
          date: firstCommit.author.date,
          message: firstCommit.message
        },
        lastCommit: {
          sha: lastCommit.sha,
          date: lastCommit.author.date,
          message: lastCommit.message
        },
        authors,
        averageCommitsPerDay: Math.round(averageCommitsPerDay * 100) / 100
      };
    } catch (error) {
      throw new Error(`Failed to get history stats: ${error.message}`);
    }
  }

  /**
   * Get the timeline of changes for a collection
   */
  async getCollectionTimeline(collection, limit = 50) {
    try {
      const commits = await this.getFileHistory(limit);
      const timeline = [];

      for (const commit of commits) {
        try {
          const fileData = await this.getFileAtCommit(commit.sha);
          const data = JSON.parse(fileData.content);
          
          if (data[collection]) {
            timeline.push({
              commit: commit.sha,
              message: commit.message,
              author: commit.author,
              date: commit.author.date,
              recordCount: data[collection].length,
              collection: collection
            });
          }
        } catch (error) {
          console.warn(`Failed to parse file at commit ${commit.sha}: ${error.message}`);
        }
      }

      return timeline;
    } catch (error) {
      throw new Error(`Failed to get collection timeline: ${error.message}`);
    }
  }

  /**
   * Revert data file to a specific commit
   */
  async revertToCommit(sha, commitMessage = `Revert to commit ${sha}`) {
    try {
      const fileData = await this.getFileAtCommit(sha);
      
      // Write the old content back to the current branch
      await this.storage.write(fileData.content, commitMessage);
      
      return {
        success: true,
        revertedTo: sha,
        message: commitMessage
      };
    } catch (error) {
      throw new Error(`Failed to revert to commit ${sha}: ${error.message}`);
    }
  }
}

module.exports = HistoryManager; 