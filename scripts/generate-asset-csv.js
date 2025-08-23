const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define directories
const backgroundDir = path.join(__dirname, '..', 'pictures', 'ArtworkToBeBackgroundRecommended');
const masterpieceDir = path.join(__dirname, '..', 'pictures', 'FamousArtPortraitsRecommended');
const outputDir = path.join(__dirname, '..');

// Function to generate CSV
function generateCsv(directory, fileName, headers, rowMapper) {
    const files = fs.readdirSync(directory).filter(file => !file.startsWith('._'));
    const rows = files.map(rowMapper);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    fs.writeFileSync(path.join(outputDir, fileName), csvContent);
    console.log(`${fileName} generated successfully.`);
}

// Generate background_assets.csv
generateCsv(
    backgroundDir,
    'background_assets.csv',
    ['asset_id', 'display_name', 'category', 'image_url', 'is_active'],
    (file) => {
        const asset_id = uuidv4();
        const display_name = path.basename(file, path.extname(file));
        const category = display_name.split('-')[0];
        // ...
        const image_url = `/pictures/ArtworkToBeBackgroundRecommended/${file}`;
        return [asset_id, display_name, category, image_url, 'TRUE'];
    }
);

// Generate masterpiece_assets.csv
generateCsv(
    masterpieceDir,
    'masterpiece_assets.csv',
    ['asset_id', 'display_name', 'artist', 'image_url', 'is_active'],
    (file) => {
        const asset_id = uuidv4();
        const [displayName, artist] = path.basename(file, path.extname(file)).split('-');
        const image_url = `/pictures/FamousArtPortraitsRecommended/${file}`;
        return [asset_id, displayName, artist || 'Unknown', image_url, 'TRUE'];
    }
);