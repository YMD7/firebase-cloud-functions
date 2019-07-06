const functions = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');

const serviceAccount = require('/Users/kyo/Dev/firebase-cloud-functions/google-application-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ymd-cf-test.firebaseio.com'
});

// squidooo test
exports.getSiteTitle = functions.https.onRequest(async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://www.yoyaku.city.ota.tokyo.jp');
  await page.waitForNavigation();

  const siteTitle = await page.title();

  await browser.close();

  console.log(siteTitle);
});

// addProfile()
exports.addProfile = functions.https.onRequest(async (req, res) => {
  const text = req.query.text;

  const db = admin.firestore();
  const doc = await db.collection('users').doc('family');

  await doc.set({
    name: text
  });

  res.redirect(200, 'http://localhost:5001/ymd-cf-test/us-central1');
});

// getProfile()
exports.getProfile = functions.https.onRequest(async (req, res) => {
  console.log('Starting getProfile');
  const db = admin.firestore();
  await db.collection('users').doc('family').get()
    .then((doc) => {
      console.log(doc.id, '=>', JSON.stringify(doc.data()));
      return true;
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

  res.redirect(200, 'http://localhost:5001/ymd-cf-test/us-central1');
});

// addMessage()
exports.addMessage = functions.https.onRequest(async (req, res) => {
  const original = req.query.text;
  const snapshot = await admin.database().ref('/messages').push({original: original});
  res.redirect(303, snapshot.ref.toString());
});

// makeUppercase()
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
  .onCreate((snapshot, context) => {
    const original = snapshot.val();
    console.log('Uppercasing', context.params.pushId, original);
    const uppercase = original.toUpperCase();
    return snapshot.ref.parent.child('uppercase').set(uppercase);
  });

