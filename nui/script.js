let selectedState = null;
let statesConfig = {};
let maxTimer = 120;
let playerSettings = {};
let quickActionsConfig = {};
let isEditMode = false;
let dragOffset = { x: 0, y: 0 };

const statusDisplay = document.getElementById('status-display');
const menuContainer = document.getElementById('menu-container');
const settingsContainer = document.getElementById('settings-container');
const quickMenu = document.getElementById('quick-menu');
const editOverlay = document.getElementById('edit-overlay');
const statesList = document.getElementById('states-list');
const timerSection = document.getElementById('timer-section');
const timerInput = document.getElementById('timer-input');
const applyBtn = document.getElementById('apply-btn');

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function applyPillSettings() {
    const pill = statusDisplay;
    const settings = playerSettings;
    
    // Reset all positioning styles first
    pill.style.position = 'fixed';
    pill.style.left = '';
    pill.style.top = '';
    pill.style.right = '';
    pill.style.bottom = '';
    pill.style.transform = '';
    
    // Apply size
    if (settings.pillSize) {
        pill.className = `status-pill size-${settings.pillSize}`;
    }
    
    // Apply position
    if (settings.pillPosition === 'custom' && settings.customPosition && settings.customPosition.x !== null && settings.customPosition.y !== null) {
        pill.style.left = settings.customPosition.x + 'px';
        pill.style.top = settings.customPosition.y + 'px';
        pill.className += ' position-custom';
    } else if (settings.pillPosition) {
        pill.className += ` position-${settings.pillPosition}`;
    }
}

function updateStatusDisplay(state, remaining, config) {
    const statusText = document.getElementById('status-text');
    const statusTimer = document.getElementById('status-timer');
    
    statusText.textContent = config.label;
    statusDisplay.style.background = config.color;
    
    if (remaining > 0) {
        statusTimer.textContent = formatTime(remaining);
        statusTimer.style.display = 'inline';
    } else {
        statusTimer.style.display = 'none';
    }
    
    applyPillSettings();
}

function showQuickMenu(x, y) {
    const quickStates = document.getElementById('quick-states');
    quickStates.innerHTML = '';
    
    if (quickActionsConfig.quickStates) {
        quickActionsConfig.quickStates.forEach(stateKey => {
            if (statesConfig[stateKey]) {
                const option = document.createElement('div');
                option.className = 'quick-option';
                option.textContent = statesConfig[stateKey].label;
                option.dataset.state = stateKey;
                option.addEventListener('click', () => {
                    fetch(`https://${GetParentResourceName()}/quickAction`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'setState',
                            state: stateKey,
                            minutes: statesConfig[stateKey].requiresTimer ? 30 : 0
                        })
                    });
                    hideQuickMenu();
                });
                quickStates.appendChild(option);
            }
        });
    }
    
    quickMenu.style.left = x + 'px';
    quickMenu.style.top = y + 'px';
    quickMenu.classList.remove('hidden');
}

function hideQuickMenu() {
    quickMenu.classList.add('hidden');
}

function createStateOption(stateKey, stateConfig) {
    const option = document.createElement('div');
    option.className = 'state-option';
    option.dataset.state = stateKey;
    
    option.innerHTML = `
        <div class="state-color" style="background-color: ${stateConfig.color}"></div>
        <div class="state-label">${stateConfig.label}</div>
    `;
    
    option.addEventListener('click', () => selectState(stateKey, stateConfig));
    return option;
}

function selectState(stateKey, stateConfig) {
    selectedState = stateKey;
    
    document.querySelectorAll('.state-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    document.querySelector(`[data-state="${stateKey}"]`).classList.add('selected');
    
    if (stateConfig.requiresTimer) {
        timerSection.classList.remove('hidden');
        timerInput.required = true;
    } else {
        timerSection.classList.add('hidden');
        timerInput.required = false;
        timerInput.value = '';
    }
    
    updateApplyButton();
}

function updateApplyButton() {
    const needsTimer = selectedState && statesConfig[selectedState]?.requiresTimer;
    const hasValidTimer = !needsTimer || (timerInput.value && parseInt(timerInput.value) > 0);
    
    applyBtn.disabled = !selectedState || !hasValidTimer;
}

function openMenu(states, maxTimerValue, settings, quickActions) {
    statesConfig = states;
    maxTimer = maxTimerValue;
    playerSettings = settings;
    quickActionsConfig = quickActions;
    
    statesList.innerHTML = '';
    Object.entries(states).forEach(([key, config]) => {
        statesList.appendChild(createStateOption(key, config));
    });
    
    timerInput.max = maxTimer;
    selectedState = null;
    timerInput.value = '';
    timerSection.classList.add('hidden');
    applyBtn.disabled = true;
    
    menuContainer.classList.remove('hidden');
}

function openSettings(settings, pillSettings, customization) {
    playerSettings = settings;
    
    // Load current settings
    document.getElementById('pill-size').value = settings.pillSize || 'medium';
    
    // Set position value
    if (settings.customPosition && settings.customPosition.x !== null) {
        document.getElementById('pill-position').value = 'custom';
    } else {
        document.getElementById('pill-position').value = settings.pillPosition || 'top-right';
    }
    
    settingsContainer.classList.remove('hidden');
}

function closeMenu() {
    menuContainer.classList.add('hidden');
    settingsContainer.classList.add('hidden');
    hideQuickMenu();
    fetch(`https://${GetParentResourceName()}/closeMenu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}

function applyState() {
    if (!selectedState) return;
    
    const minutes = statesConfig[selectedState].requiresTimer ? parseInt(timerInput.value) : 0;
    
    if (statesConfig[selectedState].requiresTimer && (!minutes || minutes <= 0 || minutes > maxTimer)) {
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/changeState`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            state: selectedState,
            minutes: minutes
        })
    });
}

function saveSettings() {
    const positionValue = document.getElementById('pill-position').value;
    const newSettings = {
        pillSize: document.getElementById('pill-size').value,
        pillPosition: positionValue,
        customPosition: positionValue === 'custom' ? playerSettings.customPosition : { x: null, y: null }
    };
    
    playerSettings = newSettings;
    
    fetch(`https://${GetParentResourceName()}/saveSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
    });
}

function enterEditMode() {
    isEditMode = true;
    editOverlay.classList.remove('hidden');
    statusDisplay.classList.add('draggable');
    statusDisplay.style.cursor = 'move';
    statusDisplay.style.zIndex = '9999';
}

function exitEditMode(save = false) {
    isEditMode = false;
    editOverlay.classList.add('hidden');
    statusDisplay.classList.remove('draggable');
    statusDisplay.style.cursor = 'pointer';
    statusDisplay.style.zIndex = '1000';
    
    if (save) {
        const rect = statusDisplay.getBoundingClientRect();
        const position = { x: rect.left, y: rect.top };
        playerSettings.customPosition = position;
        playerSettings.pillPosition = 'custom';
        
        fetch(`https://${GetParentResourceName()}/exitEditMode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: position })
        });
    } else {
        fetch(`https://${GetParentResourceName()}/exitEditMode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
    }
}

// Event Listeners
document.getElementById('close-btn').addEventListener('click', closeMenu);
document.getElementById('settings-close-btn').addEventListener('click', closeMenu);
document.getElementById('cancel-btn').addEventListener('click', closeMenu);
document.getElementById('apply-btn').addEventListener('click', applyState);
document.getElementById('settings-btn').addEventListener('click', () => {
    menuContainer.classList.add('hidden');
    openSettings(playerSettings, {}, {});
});
document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
document.getElementById('edit-position-btn').addEventListener('click', () => {
    settingsContainer.classList.add('hidden');
    enterEditMode();
});
document.getElementById('save-position-btn').addEventListener('click', () => {
    exitEditMode(true);
    closeMenu();
});
document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    exitEditMode(false);
    closeMenu();
});

document.getElementById('reset-settings-btn').addEventListener('click', () => {
    // Reset to default settings
    document.getElementById('pill-size').value = 'medium';
    document.getElementById('pill-position').value = 'top-right';
    
    playerSettings = {
        pillSize: 'medium',
        pillPosition: 'top-right',
        customPosition: { x: null, y: null }
    };
    
    fetch(`https://${GetParentResourceName()}/saveSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: playerSettings })
    });
    
    applyPillSettings();
});

timerInput.addEventListener('input', updateApplyButton);

// Drag functionality
statusDisplay.addEventListener('mousedown', (e) => {
    if (!isEditMode) return;
    
    const rect = statusDisplay.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
});

function handleDrag(e) {
    if (!isEditMode) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    const maxX = window.innerWidth - statusDisplay.offsetWidth;
    const maxY = window.innerHeight - statusDisplay.offsetHeight;
    
    statusDisplay.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
    statusDisplay.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
    statusDisplay.style.right = 'auto';
    statusDisplay.style.bottom = 'auto';
    statusDisplay.style.transform = 'none';
}

function stopDrag() {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
}

// Right-click context menu
statusDisplay.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!isEditMode && quickActionsConfig.rightClickMenu) {
        showQuickMenu(e.clientX, e.clientY);
    }
});

// Double-click toggle
statusDisplay.addEventListener('dblclick', () => {
    if (quickActionsConfig.doubleClickToggle) {
        fetch(`https://${GetParentResourceName()}/quickAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'toggle',
                minutes: 30
            })
        });
    }
});

// Quick menu actions
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-option')) {
        const action = e.target.dataset.action;
        if (action === 'toggle') {
            fetch(`https://${GetParentResourceName()}/quickAction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'toggle',
                    minutes: 30
                })
            });
        } else if (action === 'settings') {
            hideQuickMenu();
            openSettings(playerSettings, {}, {});
        }
        hideQuickMenu();
    } else if (!quickMenu.contains(e.target)) {
        hideQuickMenu();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!menuContainer.classList.contains('hidden') || !settingsContainer.classList.contains('hidden')) {
            closeMenu();
        } else {
            hideQuickMenu();
        }
    }
});

window.addEventListener('message', (event) => {
    const data = event.data;
    
    switch (data.action) {
        case 'openMenu':
            openMenu(data.states, data.maxTimer, data.playerSettings, data.quickActions);
            break;
        case 'openSettings':
            openSettings(data.playerSettings, data.pillSettings, data.customization);
            break;
        case 'closeMenu':
            menuContainer.classList.add('hidden');
            settingsContainer.classList.add('hidden');
            hideQuickMenu();
            break;
        case 'updateStatus':
            updateStatusDisplay(data.state, data.remaining, data.config);
            if (data.playerSettings) {
                playerSettings = data.playerSettings;
            }
            applyPillSettings();
            break;
        case 'enterEditMode':
            enterEditMode();
            break;
        case 'exitEditMode':
            break;
    }
});