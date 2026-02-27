# Dependency Update Guide

This guide covers updating major versions of core dependencies in the Invenet monorepo.

## General Principles

1. **Update in isolation**: Update one major dependency at a time
2. **Test thoroughly**: Run full test suite (unit, integration, E2E)
3. **Review breaking changes**: Always read the official migration guides
4. **Update docs**: Update AGENTS.md and tech stack references
5. **Commit checkpoints**: Commit after each successful update

## Before Any Update

```bash
# Ensure clean working directory
git status

# Ensure all tests pass
npx nx test invenet
npx nx e2e invenet-e2e
cd apps/Invenet.Api && dotnet test && cd ../..

# Create a branch
git checkout -b deps/update-<dependency-name>
```

## Angular Major Updates

### Current: Angular 21.1

**Official Guide**: https://angular.dev/update-guide

### Process

1. **Check compatibility**

   ```bash
   npx ng update
   ```

2. **Update Angular core**

   ```bash
   npx ng update @angular/core@<version> @angular/cli@<version>
   ```

3. **Update Angular-related dependencies**

   ```bash
   # Update Nx Angular plugin
   npx nx migrate @nx/angular@latest

   # Update Analog (Vite + Vitest for Angular)
   npm install @analogjs/vite-plugin-angular@latest @analogjs/vitest-angular@latest --save-dev
   ```

4. **Review breaking changes**
   - Read https://angular.dev/update-guide
   - Check deprecations in your codebase
   - Update component patterns (decorators → functions, etc.)

5. **Update AGENT.md references**
   - [AGENTS.md](../AGENTS.md) - Core Stack section
   - [docs/AGENT_PLAYBOOK.md](AGENT_PLAYBOOK.md) - Angular version reference

6. **Test**
   ```bash
   npx nx lint invenet
   npx nx build invenet --configuration=production
   npx nx test invenet
   npx nx e2e invenet-e2e
   ```

## Nx Major Updates

### Current: Nx 22.4.5

**Official Guide**: https://nx.dev/nx-api/nx/documents/migrate

### Process

1. **Run Nx migrate**

   ```bash
   npx nx migrate latest
   # This creates migrations.json
   ```

2. **Review migrations.json**
   - Check what will be changed
   - Review breaking changes

3. **Run migrations**

   ```bash
   npx nx migrate --run-migrations
   ```

4. **Clean up**

   ```bash
   rm migrations.json
   ```

5. **Update Nx plugins**

   ```bash
   npm install @nx/angular@latest @nx/vite@latest @nx/vitest@latest @nx/playwright@latest --save-dev
   ```

6. **Test**
   ```bash
   # Test all projects
   npx nx run-many -t test
   npx nx run-many -t build
   npx nx run-many -t lint
   ```

## PrimeNG Major Updates

### Current: PrimeNG 21.1.1

**Official Guide**: https://primeng.org/installation

### Process

1. **Check migration guide**
   - Visit https://primeng.org
   - Look for migration documentation

2. **Update PrimeNG packages**

   ```bash
   npm install primeng@latest @primeuix/themes@latest
   ```

3. **Review breaking changes**
   - Check component API changes
   - Update theme configuration if needed
   - Test UI components thoroughly

4. **Test UI**
   ```bash
   npx nx serve invenet
   # Manually test all PrimeNG components in use
   # Run visual regression tests if available
   npx nx e2e invenet-e2e
   ```

## .NET Major Updates

### Current: .NET 10

**Official Guide**: https://learn.microsoft.com/en-us/dotnet/core/porting/

### Process

1. **Update SDK locally**
   - Download and install new .NET SDK from https://dotnet.microsoft.com/download

2. **Update project files**

   ```bash
   # Update TargetFramework in all .csproj files
   # Example: <TargetFramework>net11.0</TargetFramework>
   ```

3. **Update NuGet packages**

   ```bash
   cd apps/Invenet.Api
   dotnet list package --outdated
   dotnet add package Microsoft.AspNetCore.* --version <new-version>
   dotnet add package Microsoft.EntityFrameworkCore.* --version <new-version>
   ```

4. **Review breaking changes**
   - Read official migration guide
   - Check deprecation warnings
   - Update obsolete APIs

5. **Update AGENT.md references**
   - [AGENTS.md](../AGENTS.md) - Core Stack section
   - [docs/AGENT_PLAYBOOK.md](AGENT_PLAYBOOK.md) - Stack section

6. **Test**

   ```bash
   dotnet restore
   dotnet build
   dotnet test
   dotnet run  # Verify app starts
   ```

7. **Update CI/Docker**
   - Update .NET SDK version in CI workflows
   - Update Dockerfile base images

## Entity Framework Core Updates

### Process

1. **Update packages**

   ```bash
   cd apps/Invenet.Api
   dotnet add package Microsoft.EntityFrameworkCore --version <version>
   dotnet add package Microsoft.EntityFrameworkCore.Design --version <version>
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version <version>
   ```

2. **Test migrations**

   ```bash
   # Create a test migration
   dotnet ef migrations add TestMigration

   # Check the generated SQL
   dotnet ef migrations script

   # Remove test migration
   dotnet ef migrations remove
   ```

3. **Test on local database**
   - Backup your local database first
   - Run existing migrations on fresh database
   - Verify all queries work

## Node.js Major Updates

### Process

1. **Update `.nvmrc` or document required version**

2. **Update in CI workflows**
   - GitHub Actions: `.github/workflows/*.yml`
   - Update `node-version` fields

3. **Test locally**
   ```bash
   nvm install <version>
   nvm use <version>
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   npm test
   ```

## PostgreSQL Major Updates

### Process

1. **Backup production data** (if applicable)

   ```bash
   pg_dump -U postgres -d invenet > backup.sql
   ```

2. **Review PostgreSQL release notes**
   - Check breaking changes
   - Check deprecated features

3. **Test migrations on new version**
   - Spin up new PostgreSQL version locally (Docker recommended)
   - Run all migrations from scratch
   - Verify data integrity

4. **Update connection string validation**
   - Update minimum supported version checks in code

5. **Update documentation**
   - README.md
   - Docker Compose files
   - CI configurations

## Post-Update Checklist

After any major update:

- [ ] All tests pass (unit, integration, E2E)
- [ ] Build succeeds in production mode
- [ ] Linting passes with no new warnings
- [ ] Local dev server runs without errors
- [ ] Documentation updated (AGENTS.md, README.md)
- [ ] CHANGELOG.md updated with migration notes
- [ ] CI pipeline passes
- [ ] Commit with clear message: `deps: update <name> to v<version>`

## Rollback Plan

If an update causes issues:

1. **Revert the commit**

   ```bash
   git revert <commit-hash>
   ```

2. **Or reset to previous state**

   ```bash
   git reset --hard <commit-before-update>
   ```

3. **Clean and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   # For .NET
   dotnet clean
   dotnet restore
   ```

## Helpful Commands

```bash
# Check outdated npm packages
npm outdated

# Check outdated NuGet packages
cd apps/Invenet.Api && dotnet list package --outdated

# Check Nx compatibility
npx nx report

# Clear all caches
npx nx reset
rm -rf node_modules package-lock.json
npm install
```

## Resources

- Angular: https://angular.dev/update-guide
- Nx: https://nx.dev/nx-api/nx/documents/migrate
- PrimeNG: https://primeng.org
- .NET: https://learn.microsoft.com/en-us/dotnet/core/porting/
- EF Core: https://learn.microsoft.com/en-us/ef/core/what-is-new/
