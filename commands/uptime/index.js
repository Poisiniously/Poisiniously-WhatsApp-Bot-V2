module.exports = {
    name: 'uptime',
    description: 'Zeigt an, wie lange der Bot-Server bereits online ist',

    async execute(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;

        // Die Laufzeit von Node.js in Sekunden abrufen
        const totalSeconds = process.uptime();

        // Umrechnung in Tage, Stunden, Minuten und Sekunden
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // Eine schöne, lesbare Nachricht zusammenbauen
        let uptimeString = '⏱️ *Bot-Laufzeit (Uptime)*\n\n';
        
        if (days > 0) uptimeString += `📅 *${days}* Tag${days > 1 ? 'e' : ''}\n`;
        if (hours > 0 || days > 0) uptimeString += `👑 *${hours}* Stunde${hours > 1 ? 'n' : ''}\n`;
        if (minutes > 0 || hours > 0 || days > 0) uptimeString += `💬 *${minutes}* Minute${minutes > 1 ? 'n' : ''}\n`;
        uptimeString += `🚀 *${seconds}* Sekunde${seconds > 1 ? 'n' : ''}`;

        // Nachricht an den Chat senden
        await sock.sendMessage(remoteJid, { text: uptimeString });
    }
};
