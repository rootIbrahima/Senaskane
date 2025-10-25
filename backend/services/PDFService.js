// services/PDFService.js - Service de génération de PDF
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    
    /**
     * Générer un PDF des cotisations
     */
    static async genererPDFCotisations(ceremonie, cotisations, resume) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    size: 'A4',
                    margin: 50
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // En-tête
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text('ÉTAT DES COTISATIONS', { align: 'center' })
                   .moveDown();

                doc.fontSize(12)
                   .font('Helvetica')
                   .text(`Cérémonie: ${ceremonie.titre}`, { align: 'center' })
                   .text(`Date: ${new Date(ceremonie.date_ceremonie).toLocaleDateString('fr-FR')}`, { align: 'center' })
                   .moveDown(2);

                // Résumé financier
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .text('RÉSUMÉ FINANCIER')
                   .moveDown(0.5);

                doc.fontSize(11)
                   .font('Helvetica');

                const resumeData = [
                    ['Montant total attendu:', `${this.formatMontant(resume.montantAttendu)} FCFA`],
                    ['Montant total reçu:', `${this.formatMontant(resume.montantRecu)} FCFA`],
                    ['Montant total dépensé:', `${this.formatMontant(resume.montantDepense)} FCFA`],
                    ['Solde disponible:', `${this.formatMontant(resume.soldeDisponible)} FCFA`],
                    ['Membres ayant cotisé:', `${resume.membresAyantCotise} / ${resume.totalMembres}`],
                    ['Taux de cotisation:', `${resume.tauxCotisation}%`]
                ];

                resumeData.forEach(([label, value]) => {
                    doc.text(`${label} `, { continued: true })
                       .font('Helvetica-Bold')
                       .text(value)
                       .font('Helvetica');
                });

                doc.moveDown(2);

                // Tableau des cotisations
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .text('DÉTAIL DES COTISATIONS')
                   .moveDown(0.5);

                // En-têtes du tableau
                const tableTop = doc.y;
                const col1X = 50;
                const col2X = 200;
                const col3X = 350;
                const col4X = 450;

                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .text('Nom et Prénom', col1X, tableTop)
                   .text('Montant', col2X, tableTop)
                   .text('Statut', col3X, tableTop)
                   .text('Date', col4X, tableTop);

                doc.moveTo(col1X, doc.y + 5)
                   .lineTo(550, doc.y + 5)
                   .stroke();

                doc.moveDown(0.5);

                // Lignes du tableau
                doc.font('Helvetica')
                   .fontSize(9);

                cotisations.forEach((cotisation, index) => {
                    const y = doc.y;

                    // Vérifier si on doit ajouter une nouvelle page
                    if (y > 700) {
                        doc.addPage();
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .text('Nom et Prénom', col1X, 50)
                           .text('Montant', col2X, 50)
                           .text('Statut', col3X, 50)
                           .text('Date', col4X, 50);
                        doc.moveTo(col1X, 65)
                           .lineTo(550, 65)
                           .stroke();
                        doc.y = 70;
                    }

                    const nom = `${cotisation.nom} ${cotisation.prenom}`;
                    const montant = `${this.formatMontant(cotisation.montant)} FCFA`;
                    const statut = cotisation.a_cotise ? '✓ Payé' : '✗ Non payé';
                    const date = cotisation.date_cotisation 
                        ? new Date(cotisation.date_cotisation).toLocaleDateString('fr-FR')
                        : '-';

                    doc.text(nom, col1X, doc.y)
                       .text(montant, col2X, doc.y)
                       .text(statut, col3X, doc.y)
                       .text(date, col4X, doc.y);

                    doc.moveDown(0.3);

                    // Ligne de séparation
                    if (index < cotisations.length - 1) {
                        doc.moveTo(col1X, doc.y)
                           .lineTo(550, doc.y)
                           .strokeColor('#CCCCCC')
                           .stroke()
                           .strokeColor('#000000');
                        doc.moveDown(0.3);
                    }
                });

                // Pied de page
                doc.moveDown(2);
                doc.fontSize(8)
                   .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
                         50, 750, { align: 'center' });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Générer un PDF des dépenses
     */
    static async genererPDFDepenses(ceremonie, depenses, resume) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    size: 'A4',
                    margin: 50
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // En-tête
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text('ÉTAT DES DÉPENSES', { align: 'center' })
                   .moveDown();

                doc.fontSize(12)
                   .font('Helvetica')
                   .text(`Cérémonie: ${ceremonie.titre}`, { align: 'center' })
                   .text(`Date: ${new Date(ceremonie.date_ceremonie).toLocaleDateString('fr-FR')}`, { align: 'center' })
                   .moveDown(2);

                // Résumé financier
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .text('RÉSUMÉ FINANCIER')
                   .moveDown(0.5);

                doc.fontSize(11)
                   .font('Helvetica');

                const resumeData = [
                    ['Montant total reçu:', `${this.formatMontant(resume.montantRecu)} FCFA`],
                    ['Montant total dépensé:', `${this.formatMontant(resume.montantDepense)} FCFA`],
                    ['Solde disponible:', `${this.formatMontant(resume.soldeDisponible)} FCFA`]
                ];

                resumeData.forEach(([label, value]) => {
                    doc.text(`${label} `, { continued: true })
                       .font('Helvetica-Bold')
                       .text(value)
                       .font('Helvetica');
                });

                doc.moveDown(2);

                // Tableau des dépenses
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .text('DÉTAIL DES DÉPENSES')
                   .moveDown(0.5);

                // En-têtes du tableau
                const tableTop = doc.y;
                const col1X = 50;
                const col2X = 160;
                const col3X = 350;
                const col4X = 450;

                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .text('Date', col1X, tableTop)
                   .text('Libellé', col2X, tableTop)
                   .text('Montant', col3X, tableTop)
                   .text('Par', col4X, tableTop);

                doc.moveTo(col1X, doc.y + 5)
                   .lineTo(550, doc.y + 5)
                   .stroke();

                doc.moveDown(0.5);

                // Lignes du tableau
                doc.font('Helvetica')
                   .fontSize(9);

                let totalDepenses = 0;

                depenses.forEach((depense, index) => {
                    const y = doc.y;

                    // Vérifier si on doit ajouter une nouvelle page
                    if (y > 650) {
                        doc.addPage();
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .text('Date', col1X, 50)
                           .text('Libellé', col2X, 50)
                           .text('Montant', col3X, 50)
                           .text('Par', col4X, 50);
                        doc.moveTo(col1X, 65)
                           .lineTo(550, 65)
                           .stroke();
                        doc.y = 70;
                    }

                    const date = new Date(depense.date_depense).toLocaleDateString('fr-FR');
                    const libelle = depense.libelle.substring(0, 40) + (depense.libelle.length > 40 ? '...' : '');
                    const montant = `${this.formatMontant(depense.montant)} FCFA`;
                    const enregistrePar = depense.enregistre_par_nom || 'N/A';

                    doc.text(date, col1X, doc.y)
                       .text(libelle, col2X, doc.y)
                       .text(montant, col3X, doc.y)
                       .text(enregistrePar, col4X, doc.y);

                    totalDepenses += parseFloat(depense.montant);

                    // Description si elle existe
                    if (depense.description) {
                        doc.moveDown(0.2);
                        doc.fontSize(8)
                           .fillColor('#666666')
                           .text(`   ${depense.description.substring(0, 80)}`, col2X, doc.y)
                           .fillColor('#000000')
                           .fontSize(9);
                    }

                    doc.moveDown(0.3);

                    // Ligne de séparation
                    if (index < depenses.length - 1) {
                        doc.moveTo(col1X, doc.y)
                           .lineTo(550, doc.y)
                           .strokeColor('#CCCCCC')
                           .stroke()
                           .strokeColor('#000000');
                        doc.moveDown(0.3);
                    }
                });

                // Total
                doc.moveDown(1);
                doc.moveTo(col1X, doc.y)
                   .lineTo(550, doc.y)
                   .stroke();
                doc.moveDown(0.5);

                doc.fontSize(11)
                   .font('Helvetica-Bold')
                   .text('TOTAL DES DÉPENSES:', col2X, doc.y)
                   .text(`${this.formatMontant(totalDepenses)} FCFA`, col3X, doc.y);

                // Pied de page
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
                         50, 750, { align: 'center' });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Formater un montant avec des espaces comme séparateur de milliers
     */
    static formatMontant(montant) {
        return parseFloat(montant).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
}

module.exports = PDFService;