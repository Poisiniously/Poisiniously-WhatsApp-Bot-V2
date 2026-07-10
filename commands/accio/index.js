module.exports = {
    name: 'accio',
    description: 'Fügt einen Nutzer der Gruppe hinzu.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Prüfen, ob es sich um eine Gruppe handelt
        if (!from.endsWith('@g.us')) {
            await sock.sendMessage(from, { text: '❌ Funktioniert nur in Gruppen!' }, { quoted: msg });
            return;
        }

        // Prüfen, ob eine Nummer mitgegeben wurde
        if (!args || args.length === 0) {
            await sock.sendMessage(from, { text: '❌ Fehlgeschlagen:* Du musst eine Nummer hinzufügen!' }, { quoted: msg });
            return;
        }

        // Bereinigen der Nummer (nur Zahlen übrig lassen)
        let phoneNumber = args[0].replace(/[^0-9]/g, '');
        
        // WhatsApp JID daraus bauen
        const targetJid = `${phoneNumber}@s.whatsapp.net`;

        try {
            // Nutzer zur Gruppe hinzufügen
            const response = await sock.groupParticipantsUpdate(from, [targetJid], 'add');
            
            // Baileys gibt manchmal den Status zurück, falls es nicht klappt (z.B. wegen Privatsphäre-Einstellungen des Nutzers)
            if (response[0]?.status === '403') {
                await sock.sendMessage(from, { text: '🛡️ *Accio blockiert:* Die Privatsphäre-Einstellungen dieses Nutzers erlauben kein direktes Hinzufügen.' }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `🪄 *Accio!* Der Nutzer wurde erfolgreich in die Gruppe gezogen.` }, { quoted: msg });
            }
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ *Fehler:* Bot kein Admin!' }, { quoted: msg });
        }
    }
};
