# 🚨 Priority System

A sleek, customizable FiveM priority system for law enforcement roles. Features real-time status pills, multiple priority states with timers, drag-and-drop UI, job-based permissions, and an intuitive settings panel. Perfect for police, sheriff, and state roleplay servers.

## ✨ Features

- **Real-time Status Display** - Clean pill-style status indicator
- **Multiple Priority States** - Active, Cooldown, City Safe, In Progress, Meeting, On Hold
- **Timer Support** - Automatic countdown for timed states
- **Customizable UI** - Size, position, and color options
- **Drag & Drop** - Custom positioning with visual editor
- **Job Restrictions** - Police/Sheriff/State access only

## 🎮 Controls

| Action | Control |
|--------|---------|
| Open Menu | `F6` |
| Open Settings | `F7` |
| Edit Position | Settings → Edit Position |

## 🔧 Installation

1. Download and extract to your resources folder
2. Add `ensure cl-policeprior` to your server.cfg
3. Configure jobs in `shared/config.lua`
4. Restart your server

## ⚙️ Configuration

### Priority States
```lua
Config.PriorityStates = {
    ['active'] = {
        label = 'Priority Active',
        color = '#ff4444', --- Has to be 6 bytes black
        requiresTimer = false
    },
    ['city_safe'] = {
        label = 'City Safe',
        color = '#4488ff',
        requiresTimer = false
    }
}
```

### Allowed Jobs
```lua
Config.AllowedJobs = {
    'police',
    'sheriff',
    'state'
}
```

### UI Customization
```lua
Config.PillSettings = {
    defaultSize = 'medium',
    sizes = {
        small = { padding = '6px 12px', fontSize = '12px' },
        medium = { padding = '8px 16px', fontSize = '14px' },
        large = { padding = '10px 20px', fontSize = '16px' }
    }
}
```

## 🎨 Customization

- **Pill Sizes**: Small, Medium, Large
- **Positions**: 6 preset positions + custom drag positioning
- **Colors**: Fully customizable per state
- **Timer**: Optional countdown for specific states

## 📱 UI Components

### Status Pill
- Displays current priority state
- Shows remaining time for timed states
- Smooth transitions and hover effects
- Draggable positioning

### Main Menu
- State selection with visual indicators
- Timer input for duration-based states
- Clean, modern interface

### Settings Panel
- Size and position customization
- Visual position editor
- Reset to defaults option

## 🔒 Permissions

Only players with allowed jobs can:
- Access the priority system
- Change priority states
- Use quick actions

All players can:
- Customize UI settings (size, position, etc.)

## 📋 Requirements

- FiveM Server
- ESX/QBCore Framework (optional)
- Modern web browser support

## 🐛 Support

For issues or feature requests, please check the configuration first. Most customization can be done through the config file.

## 📄 License

This resource is provided as-is for FiveM server use.
