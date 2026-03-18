/**
 * ══════════════════════════════════════════════════════
 *  Google Apps Script — Ebooks Lynette Zoumenou
 *  → Enregistre dans Google Sheets
 *  → Envoie un mail avec le lien de l'ebook
 * ══════════════════════════════════════════════════════
 *
 *  INSTALLATION :
 *  1. Va sur https://script.google.com → Nouveau projet
 *  2. Colle tout ce code, remplace les variables ci-dessous
 *  3. Déployer → Nouvelle déploiement → Type : Application Web
 *     • Exécuter en tant que : Moi
 *     • Qui a accès : Tout le monde (anonymes)
 *  4. Copie l'URL de déploiement et colle-la dans index.html
 *     à la variable APPS_SCRIPT_URL
 * ══════════════════════════════════════════════════════
 */

// ── 1. ID de ton Google Sheet ────────────────────────
// Ouvre ton Sheet, copie l'ID dans l'URL :
// https://docs.google.com/spreadsheets/d/  →ID←  /edit
const SHEET_ID = 'COLLE_ICI_LIDENTIFIANT_DE_TON_SHEET';

// ── 2. Nom de l'expéditeur (affiché dans le mail) ───
const SENDER_NAME = 'Lynette Zoumenou';

// ── 3. Liens de téléchargement de chaque ebook ──────
// Mets les liens Google Drive (partage → "Tout le monde avec le lien")
// ou n'importe quel lien direct vers le PDF/fichier.
const EBOOK_LINKS = {
  'soins-de-pieds': {
    titre:       'Guide Soins de Pieds',
    lien:        'https://LIEN-VERS-TON-EBOOK-SOINS-DE-PIEDS.pdf',
    description: 'Ton guide complet sur les soins de pieds naturels'
  },
  'conte-enfance': {
    titre:       'Conte pour Enfance',
    lien:        'https://LIEN-VERS-TON-EBOOK-CONTE.pdf',
    description: 'Un magnifique conte pour éveiller tes enfants'
  }
  // Ajoute d'autres ebooks ici si besoin :
  // 'id-ebook': { titre: '...', lien: '...', description: '...' },
};


/* ══════════════════════════════════════════════════════
   NE MODIFIE RIEN EN DESSOUS DE CETTE LIGNE
   ══════════════════════════════════════════════════════ */

function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const data   = JSON.parse(e.postData.contents);
    const prenom = (data.prenom || '').trim();
    const email  = (data.email  || '').trim();
    const ebookId = (data.ebook || '').trim();

    if (!prenom || !email || !ebookId) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Données manquantes' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Enregistrement dans Google Sheets ──────────
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // Crée les en-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date', 'Prénom', 'Email', 'Ebook']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' }),
      prenom,
      email,
      ebookId
    ]);

    // ── Envoi du mail ───────────────────────────────
    const ebook = EBOOK_LINKS[ebookId];
    if (ebook) {
      const sujet = `🎁 ${ebook.titre} — ton ebook gratuit est là !`;
      const corps = buildEmail(prenom, ebook);
      GmailApp.sendEmail(email, sujet, '', {
        htmlBody: corps,
        name: SENDER_NAME
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Gère les pre-flight CORS (OPTIONS)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Service actif' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ══════════════════════════════
   Template HTML du mail
══════════════════════════════ */
function buildEmail(prenom, ebook) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f1ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">

          <!-- Barre dorée -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#c9a96e,#e8cc9a,#c9a96e);"></td>
          </tr>

          <!-- En-tête -->
          <tr>
            <td style="padding:36px 36px 24px;text-align:center;background:#1a1510;">
              <p style="margin:0 0 6px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#c9a96e;font-weight:600;">
                Lynette Zoumenou
              </p>
              <h1 style="margin:0;font-size:26px;color:#f2ede5;font-weight:700;line-height:1.3;">
                Ton ebook est là,<br><span style="color:#c9a96e;">${prenom} 🎁</span>
              </h1>
              <p style="margin:14px 0 0;font-size:15px;color:#b0a898;line-height:1.6;">
                ${ebook.description}
              </p>
            </td>
          </tr>

          <!-- Bouton -->
          <tr>
            <td style="padding:32px 36px;text-align:center;">
              <a href="${ebook.lien}"
                 style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#a07c3a,#c9a96e);color:#fff;font-size:16px;font-weight:700;letter-spacing:.05em;text-decoration:none;border-radius:50px;box-shadow:0 6px 20px rgba(160,120,48,.35);">
                📥 Télécharger mon ebook
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#999;">
                Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br>
                <a href="${ebook.lien}" style="color:#a07c3a;word-break:break-all;">${ebook.lien}</a>
              </p>
            </td>
          </tr>

          <!-- Message perso -->
          <tr>
            <td style="padding:0 36px 32px;">
              <div style="background:#faf8f4;border-left:3px solid #c9a96e;border-radius:8px;padding:18px 20px;">
                <p style="margin:0;font-size:14px;color:#4a4030;line-height:1.7;">
                  Bonjour <strong>${prenom}</strong>,<br><br>
                  Merci de ta confiance ! J'espère que ce guide t'apportera de vraies clés pour prendre soin de toi.<br><br>
                  Si tu as des questions, n'hésite pas à me répondre directement à ce mail. 💛
                </p>
                <p style="margin:14px 0 0;font-size:14px;color:#8a5e10;font-weight:600;">
                  — Lynette Zoumenou
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;border-top:1px solid #f0ebe0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#bbb;line-height:1.6;">
                Tu reçois ce mail car tu as demandé l'ebook gratuit sur notre page.<br>
                <a href="#" style="color:#c9a96e;text-decoration:none;">Se désabonner</a>
              </p>
            </td>
          </tr>

          <!-- Barre bas -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#c9a96e,#e8cc9a,#c9a96e);"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
