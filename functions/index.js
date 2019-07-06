const functions = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');
admin.initializeApp();

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

