const Koa = require('koa');
const Router = require('koa-router');
const koaStatic = require('koa-static');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();

// Chemin vers les fichiers CSV
const sommetFilePath = path.join('./data', 'Sommet.csv');
const areteFilePath = path.join('./data', 'Aretes.csv');

// Fonction pour lire un fichier CSV et le convertir en JSON
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Route pour obtenir les sommets et arêtes
router.get('/data', async (ctx) => {
    try {
        const sommets = await readCSV(sommetFilePath);
        const aretes = await readCSV(areteFilePath);
        ctx.body = { sommets, aretes };
    } catch (err) {
        console.error("Erreur lors de la lecture des fichiers CSV:", err);
        ctx.status = 500;
        ctx.body = 'Erreur lors de la lecture des fichiers CSV';
    }
});

// Serveur de fichiers statiques pour le dossier /public
app.use(koaStatic(path.join(__dirname, 'src')));

// Utilisation du routeur
app.use(router.routes()).use(router.allowedMethods());

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
