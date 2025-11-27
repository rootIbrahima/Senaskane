const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convertIcon() {
  try {
    console.log('Converting icon.png (JPEG) to proper PNG format...');

    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const outputPath = path.join(__dirname, 'assets', 'icon-converted.png');

    // Read and convert JPEG to PNG, resize to 1024x1024
    await sharp(iconPath)
      .resize(1024, 1024, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(outputPath);

    console.log('✓ Icon converted successfully to PNG format');

    // Replace the old file
    fs.unlinkSync(iconPath);
    fs.renameSync(outputPath, iconPath);

    console.log('✓ Icon replacement complete!');
    console.log('  File: assets/icon.png is now a proper 1024x1024 PNG');

  } catch (error) {
    console.error('Error converting icon:', error.message);
    process.exit(1);
  }
}

convertIcon();
