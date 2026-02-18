# Publishing to NPM

## Setup

### 1. NPM Account Setup

First, ensure you have an npm account at [https://www.npmjs.com/](https://www.npmjs.com/)

Your username: `devgroup.se`

### 2. Local Authentication

Authenticate npm locally:

```bash
npm login
```

This will prompt you for:
- Username: `devgroup.se`
- Password: Your npm account password
- Email: Your registered email

### 3. Verify Authentication

```bash
npm whoami
```

This should return: `devgroup.se`

## Publishing a New Version

### Step 1: Generate and Rebuild the Client

```bash
# From root directory
npm run generate:api
npm run build:client
```

### Step 2: Update Version

Edit `packages/api-client/package.json` and update the version following [Semantic Versioning](https://semver.org/):

```json
{
  "version": "1.0.1"
}
```

### Step 3: Publish

```bash
npm run publish:client
```

This will automatically build and publish the package.

## Scoped Package Information

The package is published as `@devgroup.se/poe-forum-api`:

- **Scope**: `@devgroup.se` (namespace)
- **Package**: `poe-forum-api`
- **Access**: Public (anyone can install it)

### Installation

Users can install with:
```bash
npm install @devgroup.se/poe-forum-api
```

## NPM Registry Configuration (Optional)

If you need to configure `.npmrc` for the scoped package, create a `.npmrc` file in the project root:

```
@devgroup.se:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

## Troubleshooting

### "403 Forbidden" Error

- Verify npm login: `npm whoami`
- Check username matches: `devgroup.se`
- Clear npm cache: `npm cache clean --force`
- Try logging in again: `npm login`

### "Package name not found"

- Verify package name is `@devgroup.se/poe-forum-api`
- Check `packages/api-client/package.json` for correct name

### "You do not have permission to publish"

- Ensure you're logged in as the package owner
- Check that your npm account has 2FA enabled if required

## Workflow Summary

```bash
# 1. Make changes to backend API
# 2. Generate new client
npm run generate:api

# 3. Build and test
npm run build:client
npm test

# 4. Update version in packages/api-client/package.json
# 5. Publish
npm run publish:client

# 6. Notify users to update their dependencies
```

## Automation (Optional)

To automate version bumping, you can use `npm version`:

```bash
# Automatically bumps patch version and creates git tag
cd packages/api-client
npm version patch
npm publish
```

This will update the version from `1.0.0` to `1.0.1` etc.
