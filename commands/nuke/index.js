module.exports = {
    name: 'nuke',
    description: 'Degradiert alle Admins und kickt anschließend restlos alle Mitglieder aus der Gruppe.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // 1. Prüfen, ob es sich um eine Gruppe handelt
        if (!from.endsWith('@g.us')) {
            await sock.sendMessage(from, { text: '☢️ Der Nuke-Befehl kann nur in Gruppen gezündet werden!' }, { quoted: msg });
            return;
        }

        try {
            // 2. Gruppenmetadaten abrufen
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            // Die JID des Bots ermitteln, damit er sich nicht selbst degradiert oder kickt
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            // 3. Alle Admins finden (außer dem Bot selbst)
            const admins = participants
                .filter(p => (p.admin === 'admin' || p.admin === 'superadmin') && p.id !== botJid)
                .map(p => p.id);

            // 4. Warnung senden
            await sock.sendMessage(from, { text: '☢️ *WARNUNG:* System-Nuke eingeleitet. Alle Amins werden degradiert und die Gruppe wird vollständig aufgelöst...' });

            // 5. SCHRITT 1: Alle Admins demoten (degradieren)
            if (admins.length > 0) {
                try {
                    await sock.groupParticipantsUpdate(from, admins, 'demote');
                    // Kurze Pause, damit WhatsApp die Rechte-Änderung verarbeitet
                    await new Promise(resolve => setTimeout(resolve, 1500));
                } catch (demoteError) {
                    console.log('Einige Admins (evtl. der Gruppen-Ersteller) konnten nicht degradiert werden.');
                }
            }

            // 6. SCHRITT 2: Aktuelle Teilnehmerliste nach dem Demote neu laden und alle außer dem Bot kicken
            const updatedMetadata = await sock.groupMetadata(from);
            const targets = updatedMetadata.participants
                .map(p => p.id)
                .filter(id => id !== botJid);

            if (targets.length > 0) {
                // Alle verbleibenden Mitglieder restlos entfernen
                await sock.groupParticipantsUpdate(from, targets, 'remove');
            }

            // 7. Letzte Nachricht senden und die leere Gruppe verlassen
            await sock.sendMessage(from, { text: '🚪 *Nuke erfolgreich.* Die Gruppe ist bereinigt.' });
            await sock.groupLeave(from);

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ *Fehler beim Zünden des Nuke:* Überprüfe, ob ich Admin-Rechte habe oder ob der Gruppen-Ersteller die Aktion blockiert.' }, { quoted: msg });
        }
    }
};
