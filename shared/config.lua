Config = {}

Config.AllowedJobs = {
    'police',
    'sheriff',
    'state'
}

Config.Keybinds = false
Config.Keybindmenu = 'F6'
Config.Keybindsettings = 'F7'

Config.command = {
    prioritymenu = 'priority-menu',
    prioritysetting = 'priority-settings',
}


Config.UI = {
    position = {
        top = '20px',
        right = '20px'
    },
    customization = {
        allowCustomColors = true,
        allowPositioning = true,
        allowSizeChange = true,
        allowAnimations = true
    }
}

Config.PillSettings = {
    defaultSize = 'medium',
    sizes = {
        small = { padding = '6px 12px', fontSize = '12px' },
        medium = { padding = '8px 16px', fontSize = '14px' },
        large = { padding = '10px 20px', fontSize = '16px' }
    },
    positions = {
        'top-right', 'top-left', 'top-center',
        'bottom-right', 'bottom-left', 'bottom-center',
        'center-right', 'center-left'
    },
    animations = {
        'slide', 'fade', 'bounce', 'pulse', 'none'
    }
}

Config.MaxTimerMinutes = 120

Config.DefaultState = 'inactive'

Config.FallbackState = 'inactive'

Config.PriorityStates = {
    ['active'] = {
        label = 'Active',
        color = '#ff4444',
        requiresTimer = false
    },
    ['cooldown'] = {
        label = 'Cooldown',
        color = '#ff8800',
        requiresTimer = true
    },
    ['inactive'] = {
        label = 'Inactive',
        color = '#000000',
        requiresTimer = false
    },
    ['city_safe'] = {
        label = 'City Safe',
        color = '#4488ff',
        requiresTimer = false
    },
    ['in_progress'] = {
        label = 'In Progress',
        color = '#ff8844',
        requiresTimer = false
    },
    ['meeting'] = {
        label = 'Police Meeting',
        color = '#8844ff',
        requiresTimer = false
    },
    ['on_hold'] = {
        label = 'On Hold',
        color = '#ffaa00',
        requiresTimer = false
    }
}

Config.QuickActions = {
    enabled = true,
    rightClickMenu = true,
    doubleClickToggle = true,
    quickStates = { 'active', 'inactive', 'on_hold' }
}