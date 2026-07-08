const { getDevice } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'identify',
    description: 'Identifiziert entweder die Gruppe oder einen bestimmten Nutzer',

    async execute(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        // Kontext-Infos auslesen (für Markierungen/Erwähnungen oder Antworten)
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentionedJid = contextInfo?.mentionedJid?.[0]; // Erste erwähnte Person (@Nutzer)
        const quotedParticipant = contextInfo?.participant;    // Absender der Nachricht, auf die geantwortet wurde

        // Bestimmen, ob ein bestimmtes Ziel (User) anvisiert wurde
        const targetUserJid = mentionedJid || quotedParticipant || (!isGroup ? remoteJid : null);

        let profilePicUrl = null;
        let caption = '';

        // ==========================================
        // FALL 1: GRUPPEN-IDENTIFIKATION
        // ==========================================
        if (isGroup && !targetUserJid) {
            try {
                // Gruppen-Metadaten vom WhatsApp-Server abrufen
                const metadata = await sock.groupMetadata(remoteJid);
                
                const groupName = metadata.subject || 'Unbekannt';
                const groupJid = metadata.id;
                const groupCreator = metadata.owner || 'Nicht verfügbar';
                
                // Erstellungsdatum formatieren
                const creationDate = metadata.creation ? new Date(metadata.creation * 1000).toLocaleString('de-DE') : 'Unbekannt';

                // Gruppenprofilbild abrufen
                try {
                    profilePicUrl = await sock.profilePictureUrl(remoteJid, 'image');
                } catch (e) {
                    // Gruppe hat kein Bild oder Zugriff verweigert
                }

                // Text für die Gruppe zusammenbauen
                caption = `📋 *GRUPPEN-IDENTIFIKATION*\n\n`;
                caption += `👥 *Name:* ${groupName}\n`;
                caption += `🆔 *Gruppen-JID:* ${groupJid}\n`;
                caption += `👑 *Ersteller:* ${groupCreator.split('@')[0]}\n`;
                caption += `📅 *Erstellt am:* ${creationDate}\n`;
                caption += `👥 *Mitglieder:* ${metadata.participants?.length || 0}`;

            } catch (error) {
                console.error("Fehler beim Abrufen der Gruppen-Metadaten:", error);
                return await sock.sendMessage(remoteJid, { text: '❌ Fehler beim Abrufen der Gruppen-Informationen.' });
            }
        } 
        // ==========================================
        // FALL 2: NUTZER-IDENTIFIKATION (Markierung, Antwort oder PN)
        // ==========================================
        else {
            // Falls in einer Gruppe ohne Markierung/Antwort aufgerufen (Fallback, sollte durch obige Logik abgefangen sein)
            const finalUserJid = targetUserJid || msg.key.participant || remoteJid;

            const name = msg.pushName || 'Unbekannt';
            const number = finalUserJid.split('@')[0];
            const device = getDevice(msg.key.id);

            // Nutzerprofilbild abrufen
            try {
                profilePicUrl = await sock.profilePictureUrl(finalUserJid, 'image');
            } catch (error) {
                // Nutzer hat kein Bild oder Privatsphäre-Einstellungen blockieren es
            }

            // Text für den Nutzer zusammenbauen
            caption = `📋 *BENUTZER-IDENTIFIKATION*\n\n`;
            caption += `👤 *Name:* ${name}\n`;
            caption += `📞 *Nummer:* ${number}\n`;
            caption += `🆔 *JID:* ${finalUserJid}\n`;
            caption += `📱 *Gerät:* ${device}`;
        }

        // ==========================================
        // BILD DIREKT MIT SCHICKEN (FÜR BEIDE VARIANTEN)
        // ==========================================
        if (profilePicUrl) {
            // Wenn ein Bild existiert, senden wir es direkt mit dem Text als Caption
            await sock.sendMessage(remoteJid, { 
                image: { url: profilePicUrl }, 
                caption: caption 
            });
        } else {
            // Fallback: Wenn absolut kein Profilbild (weder Gruppe noch User) existiert
            await sock.sendMessage(remoteJid, { 
                text: `${caption}\n\n🖼️ _(Kein Profilbild vorhanden/sichtbar)_` 
            });
        }
    }
};
