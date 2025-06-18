# Publishing GitDB to npm

This guide explains how to publish the GitDB package to the npm registry.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm CLI**: Install npm CLI globally: `npm install -g npm`
3. **Login**: Run `npm login` and enter your credentials

## Pre-publishing Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] README.md is up to date
- [ ] LICENSE file exists
- [ ] package.json has correct version number
- [ ] All dependencies are properly listed
- [ ] No sensitive data in the package

## Publishing Steps

### 1. Update Version

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### 2. Test the Package

```bash
# Run all tests
npm test

# Check what files will be included
npm pack --dry-run
```

### 3. Publish to npm

```bash
# Publish to npm registry
npm publish

# For scoped packages (if using @git-as-a-db/gitdb)
npm publish --access public
```

### 4. Verify Publication

```bash
# Check if package is published
npm view gitdb

# Install and test the published package
npm install gitdb
```

## Package Configuration

The `package.json` is configured with:

- **`files`**: Only includes `src/`, `README.md`, and `LICENSE`
- **`exports`**: Defines module entry points
- **`prepublishOnly`**: Runs tests and linting before publish
- **`keywords`**: Helps with npm search discoverability

## Publishing to Different Registries

### npm (default)
```bash
npm publish
```

### GitHub Packages
```bash
npm publish --registry=https://npm.pkg.github.com
```

### Custom Registry
```bash
npm publish --registry=https://your-registry.com
```

## Troubleshooting

### Package Name Already Taken
If `gitdb` is already taken, consider:
- Using a scoped name: `@git-as-a-db/gitdb`
- Adding a suffix: `gitdb-database`
- Using a different name entirely

### Permission Errors
```bash
# Check if you're logged in
npm whoami

# Re-login if needed
npm login
```

### Version Conflicts
```bash
# Check current version
npm version

# Force update version
npm version patch --force
```

## Post-Publishing

1. **Create a GitHub release** with the same version tag
2. **Update documentation** if needed
3. **Monitor for issues** on GitHub and npm
4. **Respond to user feedback**

## Unpublishing

⚠️ **Warning**: Unpublishing can break other projects that depend on your package.

```bash
# Unpublish within 72 hours (npm policy)
npm unpublish gitdb@2.0.0

# Unpublish entire package (use with caution)
npm unpublish gitdb --force
```

## Best Practices

1. **Semantic Versioning**: Follow semver.org guidelines
2. **Test Before Publish**: Always run tests before publishing
3. **Documentation**: Keep README.md updated
4. **Changelog**: Maintain a CHANGELOG.md file
5. **Security**: Regularly audit dependencies with `npm audit` 