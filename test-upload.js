// Script de test pour l'upload d'images
const fs = require('fs');
const path = require('path');

// Créer un fichier de test
const testImagePath = path.join(__dirname, 'test-image.txt');
fs.writeFileSync(testImagePath, 'Test image content');

console.log('🧪 Test de l\'upload d\'images');
console.log('📁 Fichier de test créé:', testImagePath);

// Test de l'API
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
    try {
        console.log('🚀 Test de l\'API d\'upload...');

        const form = new FormData();
        form.append('file', fs.createReadStream(testImagePath));
        form.append('upload_preset', 'etu_bibliotheque');

        const response = await fetch('http://localhost:3000/api/admin/bibliotheque/upload', {
            method: 'POST',
            body: form
        });

        console.log('📊 Status:', response.status);
        console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('📋 Réponse:', data);

        if (response.ok) {
            console.log('✅ Upload test réussi!');
            console.log('🔗 URL:', data.secure_url);
        } else {
            console.log('❌ Upload test échoué:', data.error);
        }

    } catch (error) {
        console.error('❌ Erreur du test:', error.message);
    } finally {
        // Nettoyer le fichier de test
        fs.unlinkSync(testImagePath);
        console.log('🧹 Fichier de test supprimé');
    }
}

testUpload();
