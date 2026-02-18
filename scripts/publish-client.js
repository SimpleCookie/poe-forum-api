#!/usr/bin/env node

/**
 * Automated client publishing script
 * Steps:
 * 1. Generate API from swagger.json
 * 2. Build the client package
 * 3. Prompt for version update (patch/minor/major)
 * 4. Update version in packages/api-client/package.json
 * 5. Publish to npm
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const packageJsonPath = path.join(process.cwd(), 'packages/api-client/package.json')

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    red: '\x1b[31m',
}

function log(color, ...args) {
    console.log(color, ...args, colors.reset)
}

function executeCommand(command, description) {
    try {
        log(colors.blue, `\n▶ ${description}...`)
        execSync(command, { stdio: 'inherit' })
        log(colors.green, `✓ ${description}`)
        return true
    } catch (error) {
        log(colors.red, `✗ ${description} failed`)
        return false
    }
}

async function promptVersion() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        const currentVersion = packageJson.version

        log(colors.yellow, `\nCurrent version: ${currentVersion}`)
        log(colors.yellow, '\nVersion bump options:')
        log(colors.yellow, '  1) patch (e.g., 1.0.0 → 1.0.1)')
        log(colors.yellow, '  2) minor (e.g., 1.0.0 → 1.1.0)')
        log(colors.yellow, '  3) major (e.g., 1.0.0 → 2.0.0)')
        log(colors.yellow, '  4) custom version (e.g., 1.2.3)')

        rl.question('\nSelect option (1-4): ', (answer) => {
            rl.close()

            const [major, minor, patch] = currentVersion.split('.').map(Number)

            let newVersion
            switch (answer.trim()) {
                case '1':
                    newVersion = `${major}.${minor}.${patch + 1}`
                    break
                case '2':
                    newVersion = `${major}.${minor + 1}.0`
                    break
                case '3':
                    newVersion = `${major + 1}.0.0`
                    break
                case '4':
                    rl.question('Enter new version (e.g., 1.2.3): ', (customVersion) => {
                        resolve(customVersion.trim())
                    })
                    return
                default:
                    log(colors.red, 'Invalid option')
                    process.exit(1)
            }

            resolve(newVersion)
        })
    })
}

function updateVersion(newVersion) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const oldVersion = packageJson.version
    packageJson.version = newVersion

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    log(colors.green, `✓ Version updated: ${oldVersion} → ${newVersion}`)
}

async function main() {
    try {
        log(colors.blue, '\n🚀 Starting automated client publication\n')

        // Step 1: Generate API
        if (!executeCommand('npm run generate:api', 'Generating API from swagger.json')) {
            process.exit(1)
        }

        // Step 2: Build client
        if (!executeCommand('npm run build:client', 'Building client package')) {
            process.exit(1)
        }

        // Step 3: Prompt for version
        const newVersion = await promptVersion()

        // Step 4: Update version
        updateVersion(newVersion)

        // Step 5: Publish
        if (!executeCommand('npm run publish:client', 'Publishing to npm')) {
            process.exit(1)
        }

        log(colors.green, '\n✨ Publication complete!')
        log(colors.green, `Package @devgroup.se/poe-forum-api@${newVersion} published successfully\n`)
    } catch (error) {
        log(colors.red, '\n❌ Error:', error.message)
        process.exit(1)
    }
}

main()
