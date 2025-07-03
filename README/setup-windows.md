# Windows Setup Guide

This guide covers setting up the SpacetimeDB Kanban demo on Windows. We recommend using WSL2 for the best development experience.

## Option 1: WSL2 Setup (Recommended)

### Prerequisites
1. Windows 10 version 2004+ or Windows 11
2. WSL2 installed with Ubuntu

### Enable WSL2
```powershell
# Run in PowerShell as Administrator
wsl --install

# Set WSL2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu
```

### Setup in WSL2
Once in WSL2 Ubuntu:
```bash
# Follow the Linux setup guide
curl -sSf https://install.spacetimedb.com | bash
```

Then continue with [Linux Setup Guide](setup-linux.md) from Step 2.

## Option 2: Native Windows Setup

### Prerequisites
- **Node.js 20+**: Download from [nodejs.org](https://nodejs.org/)
- **Git for Windows**: Download from [git-scm.com](https://git-scm.com/download/win)
- **.NET SDK 8.0+**: Download from [dot.net](https://dotnet.microsoft.com/download)

### Step 1: Install SpacetimeDB

```powershell
# In PowerShell (as Administrator)
# Download the Windows installer
Invoke-WebRequest -Uri "https://install.spacetimedb.com/windows/spacetime-installer.msi" -OutFile "spacetime-installer.msi"

# Run the installer
msiexec /i spacetime-installer.msi

# Or use winget if available
winget install Clockwork.SpacetimeDB
```

### Step 2: Install .NET WASI Support

```powershell
# In PowerShell
dotnet workload install wasi-experimental
```

### Step 3: Clone and Setup Project

```powershell
# Clone the repository
git clone [your-repo-url] spacetimedb-kanban
cd spacetimedb-kanban\initial

# Install client dependencies
cd client
npm install

# Return to project root
cd ..
```

### Step 4: Build and Start Services

```powershell
# Terminal 1: Build and publish
spacetime publish --project-path server kanban-plus

# Terminal 2: Start SpacetimeDB
spacetime start kanban-plus

# Terminal 3: Start client
cd client
npm run dev
```

## VS Code Integration

### Recommended Extensions
- **Svelte for VS Code**
- **C# Dev Kit**
- **ESLint**
- **Prettier**

### WSL2 Remote Development
1. Install "WSL" extension in VS Code
2. Open WSL terminal
3. Navigate to project: `cd /mnt/c/path/to/project`
4. Open in VS Code: `code .`

## Troubleshooting

### "spacetime is not recognized"
- Add to PATH: `C:\Program Files\SpacetimeDB\bin`
- Restart PowerShell/Command Prompt

### Node.js version issues
```powershell
# Check version
node --version

# If < 20, install via winget
winget install OpenJS.NodeJS.LTS
```

### Build errors with .NET
- Ensure .NET SDK 8.0+: `dotnet --list-sdks`
- Restart after WASI workload install

### WSL2 Network Issues
If localhost doesn't work from Windows browser:
1. Find WSL2 IP: `wsl hostname -I`
2. Use that IP instead of localhost

### File Watching Issues in WSL2
Add to client `vite.config.js`:
```javascript
server: {
  watch: {
    usePolling: true
  }
}
```

## Performance Tips

### For WSL2
- Store code in WSL2 filesystem (`~/projects/`) not Windows (`/mnt/c/`)
- Use Windows Terminal for better performance
- Allocate more resources in `.wslconfig`

### For Native Windows
- Exclude project directory from Windows Defender
- Use PowerShell Core instead of Windows PowerShell
- Consider using pnpm instead of npm for faster installs

## Next Steps

- Read the [Architecture Overview](architecture.md)
- Set up your [development environment](development.md)
- Join the development! See [current tasks](../TODO/TRACKING/style-overhaul.md)