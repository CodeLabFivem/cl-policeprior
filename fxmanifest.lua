fx_version 'cerulean'
game 'gta5'

name 'CodeLab'
description 'UI-based Priority Status System for Police Departments'
version '1.0.0'

shared_scripts {
    'shared/config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

ui_page 'nui/index.html'

files {
    'nui/index.html',
    'nui/style.css',
    'nui/script.js'
}

lua54 'yes'