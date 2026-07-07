module.exports = {
    name: 'ping',
    description: 'Misst die Antwortzeit des Bots',
    async execute(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;

        // Zeitstempel der eingehenden Nachricht (in Millisekunden)
        // Baileys liefert messageTimestamp oft in Sekunden, daher * 1000
        const messageTimestamp = (msg.messageTimestamp) ? msg.messageTimestamp * 1000 : Date.now();
        
        // Aktuelle Zeit messen
        const currentTimestamp = Date.now();
        
        // Differenz berechnen
        const latency = currentTimestamp - messageTimestamp;

        // Nachricht mit der gemessenen Latenz senden
        await sock.sendMessage(remoteJid, { 
            text: `🏓 *Pong!*\n⏱️ Latenz: _${latency}ms_` 
        });
    }
};
