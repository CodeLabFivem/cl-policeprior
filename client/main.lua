local QBCore = exports['qb-core']:GetCoreObject()
local isMenuOpen = false
local isSettingsOpen = false
local currentStatus = {
    state = Config.DefaultState,
    remaining = 0
}

local playerSettings = {
    pillSize = Config.PillSettings.defaultSize,
    pillPosition = 'top-right',
    pillAnimation = 'slide',
    customPosition = { x = nil, y = nil }
}

local function SavePlayerSettings()
    local citizenId = QBCore.Functions.GetPlayerData().citizenid
    if citizenId then
        SetResourceKvp('priority-system_' .. citizenId, json.encode(playerSettings))
    end
end

local function LoadPlayerSettings()
    local citizenId = QBCore.Functions.GetPlayerData().citizenid
    if citizenId then
        local saved = GetResourceKvpString('priority_settings_' .. citizenId)
        if saved then
            local decoded = json.decode(saved)
            if decoded then
                playerSettings = decoded
            end
        end
    end
end

local function HasPoliceJob()
    local PlayerData = QBCore.Functions.GetPlayerData()
    if not PlayerData.job then return false end
    
    for _, job in ipairs(Config.AllowedJobs) do
        if PlayerData.job.name == job then
            return true
        end
    end
    return false
end

local function OpenMenu()
    if not HasPoliceJob() then return end
    
    isMenuOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openMenu',
        states = Config.PriorityStates,
        maxTimer = Config.MaxTimerMinutes,
        playerSettings = playerSettings,
        quickActions = Config.QuickActions
    })
end

local function OpenSettings()   
    isSettingsOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openSettings',
        playerSettings = playerSettings,
        pillSettings = Config.PillSettings,
        customization = Config.UI.customization
    })
end

local function CloseMenu()
    isMenuOpen = false
    isSettingsOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({action = 'closeMenu'})
end

local function UpdateStatusDisplay()
    SendNUIMessage({
        action = 'updateStatus',
        state = currentStatus.state,
        remaining = currentStatus.remaining,
        config = Config.PriorityStates[currentStatus.state],
        playerSettings = playerSettings
    })
end

if Config.Keybinds then
    RegisterKeyMapping(Config.command.prioritymenu, 'Open Priority Menu', 'keyboard', Config.Keybindmenu)
    RegisterKeyMapping(Config.command.prioritysetting, 'Open Priority Settings', 'keyboard', Config.Keybindsettings)
end


RegisterCommand(Config.command.prioritymenu, function()
    if not isMenuOpen and not isSettingsOpen then
        OpenMenu()
    end
end)

RegisterCommand(Config.command.prioritysetting, function()
    if not isMenuOpen and not isSettingsOpen then
        OpenSettings()
    end
end)

RegisterNUICallback('closeMenu', function(data, cb)
    CloseMenu()
    cb('ok')
end)

RegisterNUICallback('changeState', function(data, cb)
    TriggerServerEvent('cl-policeprior:changeState', data.state, data.minutes)
    CloseMenu()
    cb('ok')
end)

RegisterNUICallback('saveSettings', function(data, cb)
    playerSettings = data.settings
    SavePlayerSettings()
    UpdateStatusDisplay()
    CloseMenu()
    cb('ok')
end)

RegisterNUICallback('enterEditMode', function(data, cb)
    SendNUIMessage({ action = 'enterEditMode' })
    cb('ok')
end)

RegisterNUICallback('exitEditMode', function(data, cb)
    if data.position then
        playerSettings.customPosition = data.position
        playerSettings.pillPosition = 'custom'
        SavePlayerSettings()
    end
    UpdateStatusDisplay()
    cb('ok')
end)

RegisterNUICallback('quickAction', function(data, cb)
    if data.action == 'toggle' then
        local newState = currentStatus.state == 'inactive' and 'active' or 'inactive'
        TriggerServerEvent('cl-policeprior:changeState', newState, data.minutes or 30)
    elseif data.action == 'setState' then
        TriggerServerEvent('cl-policeprior:changeState', data.state, data.minutes)
    end
    cb('ok')
end)

RegisterNetEvent('cl-policeprior:updateStatus', function(state, remaining)
    currentStatus.state = state
    currentStatus.remaining = remaining
    UpdateStatusDisplay()
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    LoadPlayerSettings()
    Wait(500)
    TriggerServerEvent('cl-policeprior:requestStatus')
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function()
    TriggerServerEvent('cl-policeprior:requestStatus')
end)

CreateThread(function()
    while true do
        if currentStatus.remaining > 0 then
            currentStatus.remaining = math.max(0, currentStatus.remaining - 1)
            UpdateStatusDisplay()
        end
        Wait(1000)
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        Wait(1000)
        LoadPlayerSettings()
        Wait(500)
        TriggerServerEvent('cl-policeprior:requestStatus')
    end
end)