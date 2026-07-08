const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    description: 'Zeigt eine Liste aller verfügbaren Befehle an',

    async execute(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;
        
        // Der Prefix, den du eingestellt hast
        const prefix = '§'; 

        // Pfad zum Haupt-Commands-Ordner ermitteln
        // Da wir uns in commands/menu/ befinden, müssen wir zwei Ordner nach oben gehen
        const commandsDir = path.join(__dirname, '../');

        let menuText = '🤖 *BOT MENÜ / BEFEHLE* 🤖\n\n';
        menuText += `Nutze das Präfix *${prefix}* vor jedem Befehl.\n\n`;

        try {
            // Alle Ordner im commands-Verzeichnis auslesen
            const folders = fs.readdirSync(commandsDir);

            for (const folder of folders) {
                const commandPath = path.join(commandsDir, folder, 'index.js');
                
                // Prüfen, ob eine index.js im Ordner existiert
                if (fs.existsSync(commandPath)) {
                    // Den Befehl temporär einlesen, um Name und Beschreibung zu holen
                    const command = require(commandPath);
                    
                    if (command.name) {
                        const cmdName = command.name.toLowerCase();
                        const cmdDesc = command.description || 'Keine Beschreibung verfügbar.';
                        
                        // Befehl formatiert zum Text hinzufügen
                        menuText += `✨ *${prefix}${cmdName}*\n`;
                        menuText += `📝 _${cmdDesc}_\n\n`;
                    }
                }
            }

            menuText += '--------------------------------';
            
            // Das fertige Menü an den Chat senden
            await sock.sendMessage(remoteJid, { text: menuText });

        } catch (error) {
            console.error('Fehler beim Erstellen des Menüs:', error);
            await sock.sendMessage(remoteJid, { text: '❌ Fehler beim Laden des Menüs.' });
        }
    }
};
