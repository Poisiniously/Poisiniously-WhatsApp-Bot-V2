const { getDevice } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'identify',
    description: 'Zeigt Profilbild, Nummer, Name, JID und Gerät des Nutzers an',

    async execute(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;
        
        // 1. JID des Absenders ermitteln (unterscheidet zwischen Gruppe und privatem Chat)
        const senderJid = msg.key.participant || msg.key.remoteJid;
        
        // 2. Anzeigename (Push-Name) auslesen
        const name = msg.pushName || 'Unbekannt';
        
        // 3. Telefonnummer aus der JID extrahieren
        const number = senderJid.split('@')[0];
        
        // 4. Gerätetyp ermitteln (Nutzt die Baileys Hilfsfunktion 'getDevice')
        // Erkennt z.B. 'android', 'ios', 'web' oder 'unknown'
        const device = getDevice(msg.key.id);

        // 5. Profilbild-URL abrufen (Fallback, falls kein Bild vorhanden ist)
        let profilePicUrl = 'Kein Profilbild vorhanden';
        try {
            profilePicUrl = await sock.profilePictureUrl(senderJid, 'image');
        } catch (error) {
            // Fehler tritt auf, wenn der User kein Profilbild hat oder die Privatsphäre-Einstellungen es blockieren
        }

        // Text für die Antwort zusammenbauen
        let caption = `📋 *BENUTZER-IDENTIFIKATION*\n\n`;
        caption += `👤 *Name:* ${name}\n`;
        caption += `📞 *Nummer:* ${number}\n`;
        caption += `🆔 *JID:* ${senderJid}\n`;
        caption += `📱 *Gerät:* ${device}\n\n`;
        caption += `🖼️ *Profilbild-Link:* ${profilePicUrl}`;

        // 6. Antwort senden
        if (profilePicUrl !== 'Kein Profilbild vorhanden') {
            // Wenn ein Bild existiert, senden wir es direkt mit dem Text als Beschreibung (Caption)
            await sock.sendMessage(remoteJid, { 
                image: { url: profilePicUrl }, 
                caption: caption 
            });
        } else {
            // Wenn kein Bild existiert, senden wir nur den reinen Text
            await sock.sendMessage(remoteJid, { text: caption });
        }
    }
};
