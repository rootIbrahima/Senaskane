// Script pour créer les assets manquants
const fs = require('fs');
const path = require('path');

// Image PNG 1x1 transparente en base64
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Image PNG verte 1024x1024 simple (pour icon)
const greenIconPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+M9QzwAEjDAGNKGhoQkALjYEAy1IgJ4AAAAASUVORK5CYII=',
  'base64'
);

const assetsDir = path.join(__dirname, 'assets');

// Créer le dossier assets s'il n'existe pas
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Créer les fichiers
const files = {
  'icon.png': greenIconPNG,
  'splash.png': greenIconPNG,
  'adaptive-icon.png': greenIconPNG,
  'favicon.png': transparentPNG,
};

Object.keys(files).forEach(filename => {
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, files[filename]);
  console.log(`✅ Créé: ${filename}`);
});

console.log('\n🎉 Tous les assets ont été créés avec succès!');
console.log('💡 Vous pouvez maintenant démarrer Expo.');
