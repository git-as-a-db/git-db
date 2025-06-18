/**
 * GitHubStorage - Handles GitHub API storage
 */

class GitHubStorage {
  constructor(options = {}) {
    this.owner = options.owner;
    this.repo = options.repo;
    this.branch = options.branch || 'main';
    this.path = options.path || 'data/database.json';
    this.token = options.token;
    this.compression = options.compression !== false;
    this.octokit = null;
  }

  /**
   * Initialize GitHub storage
   */
  async initialize() {
    if (!this.token) {
      throw new Error('GitHub token is required for GitHub storage');
    }
    if (!this.owner || !this.repo) {
      throw new Error('GitHub owner and repo are required for GitHub storage');
    }
    
    try {
      const { Octokit } = require('@octokit/rest');
      this.octokit = new Octokit({ 
        auth: this.token,
        userAgent: 'GitDB/1.0.0'
      });
    } catch (error) {
      throw new Error(`Failed to initialize GitHub storage: ${error.message}`);
    }
  }

  /**
   * Read data from GitHub
   */
  async read() {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.path,
        ref: this.branch
      });

      if (response.data.type === 'file') {
        const content = Buffer.from(response.data.content, 'base64').toString('utf8');
        return content;
      }
      
      throw new Error('Path is not a file');
    } catch (error) {
      if (error.status === 404) {
        return '{}';
      }
      throw new Error(`Failed to read from GitHub: ${error.message}`);
    }
  }

  /**
   * Write data to GitHub
   */
  async write(data, commitMessage) {
    const { sha } = await this.getFileInfo();
    const content = Buffer.from(data).toString('base64');
    
    // Create or update file
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: this.path,
      message: commitMessage,
      content: content,
      sha: sha,
      branch: this.branch
    });
    
    return true;
  }

  /**
   * Get GitHub file info
   */
  async getFileInfo() {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.path,
        ref: this.branch
      });
      return { sha: response.data.sha };
    } catch (error) {
      if (error.status === 404) {
        return { sha: null };
      }
      throw error;
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(limit = 10) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        path: this.path,
        per_page: limit
      });
      
      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author,
        date: commit.commit.author.date
      }));
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error.message}`);
    }
  }

  /**
   * Get a specific version
   */
  async getVersion(sha) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.path,
        ref: sha
      });
      
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to get version: ${error.message}`);
    }
  }

  /**
   * Get storage configuration
   */
  getConfig() {
    return {
      owner: this.owner,
      repo: this.repo,
      branch: this.branch,
      path: this.path,
      compression: this.compression
    };
  }

  /**
   * Close storage connections
   */
  async close() {
    // No connections to close for GitHub storage
  }
}

module.exports = GitHubStorage; 