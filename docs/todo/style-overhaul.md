# SpacetimeDB Kanban Style Overhaul Plan

## Overview
Complete redesign of the Kanban app using shadcn-svelte for a modern, minimalist UI with dark/light mode support and customizable theme colors.

## Phase 1: Infrastructure (Sequential - 1 Agent)

### 1.1 shadcn-svelte Setup
```bash
npx shadcn-svelte@latest init
```
- Automatically installs Tailwind CSS and dependencies
- Creates global CSS with CSS variables
- Sets up component structure

### 1.2 Server Model Updates
Update server models to support new features:

**Card Table**
- Add `position: int` field for sorting within columns
- Cards ordered by position, new cards get max(position) + 1

**User Table**
- Add `theme_mode: string` (light/dark/system)
- Add `primary_color: string` (color name)
- Add `accent_style: string` (complementary/triadic/analogous)

### 1.3 New Reducers
```csharp
// Card position management
UpdateCardPosition(cardId, newPosition, columnId)

// User theme preferences
UpdateUserTheme(themeMode, primaryColor, accentStyle)
```

## Phase 2: Core Systems (2 Agents Parallel)

### Agent A: Theme System
1. **Create theme-store.svelte.ts**
   - 12 primary colors (Slate, Blue, Indigo, Purple, Pink, Rose, Red, Orange, Amber, Green, Teal, Cyan)
   - Automatic secondary color generation using HSL
   - Each color includes 11 shades (50-950)
   - Persist to database

2. **ThemeProvider Component**
   - Wraps app, provides theme context
   - Updates CSS variables dynamically

3. **ThemeSwitcher Component**
   - Light/Dark/System toggle
   - Color picker with swatches
   - Live preview

### Agent B: Component Library
Install shadcn-svelte components:
- Button, Card, Dialog, Input, Select
- Badge, Avatar, Skeleton, Toast
- DropdownMenu, Sheet, Tooltip
- Command (for search/shortcuts)

## Phase 3: Reusable Components (5 Agents Parallel)

### Agent A: User Components
**UserDisplay.svelte**
```typescript
interface Props {
  user?: User;
  identity?: Identity;
  showAvatar?: boolean;
  showOnlineStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'badge';
}
```
- Replaces pattern: `user.name || user.id.toHexString().substring(0, 8)`
- Avatar with initials
- Online indicator
- Tooltip with full info

**UserAvatar.svelte**
- Consistent avatar rendering
- Fallback to initials or icon

### Agent B: Action Components
**LoadingButton.svelte**
```typescript
interface Props {
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onclick?: () => void | Promise<void>;
}
```
- Wraps shadcn Button
- Loading spinner
- Prevents double-clicks

**EmptyState.svelte**
```typescript
interface Props {
  icon?: ComponentType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onclick: () => void;
  };
}
```
- For empty boards, columns, no results

### Agent C: Board Components
**CardStatusBadge.svelte**
- Colored badges for todo/in_progress/done
- Consistent across app

**BoardMemberList.svelte**
- Avatar group for collaborators
- "+N more" overflow
- Add member button

### Agent D: Drag & Drop
- Implement svelte-dnd-action (production ready, accessible)
- Update card positions on drop
- Optimistic updates with rollback
- Touch gesture support

### Agent E: Search & Command
**SearchInput.svelte**
- Debounced search
- Clear button
- Loading state

**CommandPalette.svelte**
- Global keyboard shortcuts
- Quick navigation
- Action shortcuts

## Phase 4: UI Refactoring (3 Agents Parallel)

### Agent A: Board Components
- BoardList with shadcn Cards
- BoardView with proper layout
- Board creation with Dialog

### Agent B: Kanban Board
- KanbanBoard with column grid
- CardColumn with drop zones
- CardItem with new design
- Drag & drop integration

### Agent C: User & Collaboration
- UserProfile with Avatar
- CollaboratorList with badges
- AddCollaboratorModal → Dialog

## Phase 5: Polish & Future Features (5 Agents Parallel)

### Agent A: Mobile Responsive
- Sheet for mobile sidebar
- Touch gestures
- Responsive grids
- Create docs/todo/mobile-responsive.md

### Agent B: Keyboard Shortcuts
- Command palette (Cmd+K)
- Navigation (arrows)
- Quick actions (C, B)
- Create docs/todo/keyboard-shortcuts.md

### Agent C: Toast Notifications
- Real-time updates
- Success/error messages
- Preferences
- Create docs/todo/notifications.md

### Agent D: Gamified Real-time Features
Create docs/todo/gamification-features.md with 20 ideas:
1. **Live Cursor Tracking** - See other users' cursors
2. **Presence Bubbles** - Animated user avatars
3. **Card Race Mode** - Completion competitions
4. **Productivity Streaks** - Daily/weekly badges
5. **Team Velocity Visualizer** - Real-time burndown
6. **Card Physics** - Drop animations
7. **Collaborative Drawing** - Whiteboard mode
8. **Emoji Reactions** - Real-time reactions
9. **Focus Mode Indicators** - Deep work status
10. **Achievement System** - Unlock features
11. **Card Estimation Poker** - Team voting
12. **Time Tracking Races** - Estimate accuracy
13. **Board Templates Marketplace** - Share templates
14. **Real-time Code Snippets** - Syntax highlighting
15. **Voice Notes** - Audio comments
16. **Card Dependencies Graph** - Force-directed
17. **Weather-based Themes** - Dynamic themes
18. **Pomodoro Timer Sync** - Team sessions
19. **Card Confetti** - Celebrations
20. **Ghost Users** - AI helpers

### Agent E: AI Integration
Create docs/todo/ai-features.md with 8 features:
1. **Natural Language Task Creation**
   - "Bug in auth.js..." → Creates card
   - Requires: Comments system

2. **Smart Card Suggestions**
   - AI-powered next actions
   - Requires: ML integration

3. **Code Context Integration**
   - Link GitHub commits
   - Requires: GitHub API

4. **AI Standup Assistant**
   - Daily summaries
   - Requires: NLG

5. **Intelligent Card Routing**
   - Smart assignment
   - Requires: User profiles

6. **Predictive Due Dates**
   - Historical analysis
   - Requires: Analytics

7. **AI Pair Programming**
   - Implementation help
   - Requires: LLM integration

8. **Meeting Transcription**
   - Audio to cards
   - Requires: Speech-to-text

## Required Permissions
Update .claude/settings.local.json:
```json
{
  "permissions": {
    "allow": [
      "Bash(spacetime publish:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(spacetime generate:*)",
      "Bash(npm run check:*)",
      "Bash(rm:*)",
      "Bash(grep:*)",
      "Bash(npm run lint)",
      "Bash(npm install:*)",
      "Bash(npm run dev:*)",
      "Bash(npm run build:*)",
      "Bash(npx:*)",
      "Write(docs/todo/*)",
      "Bash(git:*)",
      "Bash(cd:*)"
    ],
    "deny": []
  }
}
```

## Key Decisions

### Why svelte-dnd-action?
- Production ready and mature
- Works with Svelte 5 runes
- Accessible by default
- Touch support

### Color Palette
12 carefully selected colors that work in both light and dark modes, with automatic complementary color generation for a cohesive design system.

### Component Architecture
Leveraging shadcn-svelte's headless components with Bits UI for maximum flexibility and consistent styling.

## Questions to Resolve
1. Should we add `column_id` field instead of string-based state?
2. How to handle position conflicts with simultaneous drags?
3. Should theme sync across devices or be device-specific?
4. Virtual scrolling for boards with many cards?

## Success Metrics
- All components use shadcn-svelte
- Full dark/light mode support
- Mobile responsive
- Drag & drop working
- Theme persistence
- Improved UX with loading states and animations