local QBCore = exports['qb-core']:GetCoreObject()
local currentPriority = {
    state = Config.DefaultState,
    endTime = 0
}

local function SavePriorityData()
    SetResourceKvp('priority_state', currentPriority.state)
    SetResourceKvp('priority_endtime', tostring(currentPriority.endTime))
end

local function LoadPriorityData()
    local state = GetResourceKvpString('priority_state')
    local endTime = GetResourceKvpString('priority_endtime')
    
    if state and Config.PriorityStates[state] then
        currentPriority.state = state
        currentPriority.endTime = endTime and tonumber(endTime) or 0
        
        if currentPriority.endTime > 0 and currentPriority.endTime <= os.time() then
            currentPriority.state = Config.FallbackState
            currentPriority.endTime = 0
        end
    end
end

local function BroadcastPriorityUpdate()
    local remaining = math.max(0, currentPriority.endTime - os.time())
    TriggerClientEvent('cl-policeprior:updateStatus', -1, currentPriority.state, remaining)
end

local function CheckTimer()
    if currentPriority.endTime > 0 and os.time() >= currentPriority.endTime then
        currentPriority.state = Config.FallbackState
        currentPriority.endTime = 0
        SavePriorityData()
        BroadcastPriorityUpdate()
    end
end

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        LoadPriorityData()
        BroadcastPriorityUpdate()
        
        CreateThread(function()
            while true do
                CheckTimer()
                Wait(1000)
            end
        end)
    end
end)

RegisterNetEvent('cl-policeprior:changeState', function(newState, minutes)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    local job = Player.PlayerData.job.name
    local hasPermission = false
    
    for _, allowedJob in ipairs(Config.AllowedJobs) do
        if job == allowedJob then
            hasPermission = true
            break
        end
    end
    
    if not hasPermission then return end
    
    if not Config.PriorityStates[newState] then return end
    
    local stateConfig = Config.PriorityStates[newState]
    
    if stateConfig.requiresTimer then
        if not minutes or minutes <= 0 or minutes > Config.MaxTimerMinutes then
            return
        end
        currentPriority.endTime = os.time() + (minutes * 60)
    else
        currentPriority.endTime = 0
    end
    
    currentPriority.state = newState
    SavePriorityData()
    BroadcastPriorityUpdate()
    
    print(string.format('[Priority System] %s (%s) changed priority to %s', Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname, job, stateConfig.label))
end)

RegisterNetEvent('cl-policeprior:requestStatus', function()
    local remaining = math.max(0, currentPriority.endTime - os.time())
    TriggerClientEvent('cl-policeprior:updateStatus', source, currentPriority.state, remaining)
end)