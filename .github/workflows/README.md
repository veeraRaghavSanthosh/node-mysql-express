# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, linting, and quality checks.

## Workflows

### 1. Pull Request Checks (`pr-checks.yml`)

This workflow runs automatically on:
- Pull requests to `master` or `main` branches
- Direct pushes to `master` or `main` branches

#### Features:

**Multi-Node Version Testing:**
- Tests against Node.js versions 16.x, 18.x, and 20.x
- Ensures compatibility across different Node.js versions

**MySQL Database Service:**
- Provides MySQL 8.0 database for testing
- Creates a test database (`test_db`)
- Configures common environment variables for database connection

**Automated Dependency Management:**
- Uses `npm ci` for faster, reliable installs when `package-lock.json` exists
- Falls back to `npm install` for projects without lock files
- Caches npm dependencies for faster builds

**Linting:**
- Automatically detects ESLint configuration
- Runs `npm run lint` if available
- Falls back to direct ESLint execution
- Gracefully skips if no linting setup is found

**Testing:**
- Runs `npm run test` or `npm test` if configured
- Provides database environment variables for tests
- Fails the build if tests fail (ensuring quality)

**Code Formatting:**
- Checks Prettier formatting if configured
- Supports multiple Prettier script names
- Non-blocking (continues even if formatting issues exist)

**Security Auditing:**
- Runs `npm audit` to check for vulnerabilities
- Separate job for security checks
- Continues even if vulnerabilities are found (for awareness)

## Backward Compatibility

The workflows are designed to be backward compatible:

1. **Graceful Degradation:** If tools or scripts aren't configured, the workflow will skip those steps with informative messages rather than failing.

2. **Flexible Package Management:** Works with both `package-lock.json` (npm ci) and without (npm install).

3. **Multiple Node Versions:** Tests against multiple Node.js versions to ensure compatibility.

4. **Environment Variable Coverage:** Provides multiple common database environment variable patterns.

5. **Non-Breaking Checks:** Linting and formatting checks are set to `continue-on-error: true` so they don't break existing workflows.

## Configuration

### For New Projects

To get the most out of these workflows, consider adding these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest", // or your preferred test runner
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format:check": "prettier --check .",
    "format": "prettier --write ."
  }
}
```

### Environment Variables

The workflow provides these environment variables for database connections:

```bash
# Standard MySQL variables
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=test_db
MYSQL_PORT=3306

# Alternative naming conventions
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=test_db
DB_PORT=3306

NODE_ENV=test
```

### Customization

You can customize the workflows by:

1. **Modifying Node versions:** Update the `matrix.node-version` array
2. **Changing database setup:** Modify the MySQL service configuration
3. **Adding more checks:** Add additional steps to existing jobs
4. **Creating new workflows:** Add new `.yml` files for specific needs

### Troubleshooting

If the workflow fails:

1. **Check the Actions tab** in your GitHub repository
2. **Review the logs** for specific error messages
3. **Ensure your `package.json`** has the necessary scripts
4. **Verify database connections** if tests require a database
5. **Check Node.js version compatibility** if using newer features

## Security Notes

- The workflow uses MySQL with a root password for testing purposes only
- Never commit real credentials to your repository
- Use GitHub Secrets for production environment variables
- The security audit step helps identify vulnerable dependencies

## Support

This CI setup supports:
- ✅ Node.js Express applications
- ✅ MySQL database integration
- ✅ ESLint linting
- ✅ Prettier code formatting
- ✅ Jest/Mocha/other test frameworks
- ✅ npm and yarn package managers
- ✅ TypeScript projects (with appropriate ESLint config)