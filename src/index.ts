import express from 'express';
import * as admin from 'firebase-admin';

const app = express();
const PORT = 8080;
app.listen(PORT);
app.use(express.json());

const firebase = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://dog-walk-diary-default-rtdb.firebaseio.com',
});

const database = admin.firestore();

const greetURI = '/greeting';

app.get(greetURI, (req, res) => {
  const greetingID = JSON.stringify(req.query.greetID);
  res.status(200).send({
    greeting: greetingID,
  });
});

app.post(greetURI, (req, res) => {
  const greetingID = req.body.greetID;
  res.status(200).send({
    greeting: greetingID,
  });
});

app.get('/get-random-greeting', async (req, res) => {
  const allGreetings = await database.collection('get-random-greeting').get();
  const greetingData = allGreetings.docs.map((el) => el.data());

  const i = Math.floor(Math.random() * greetingData.length);
  const random = greetingData[i].greeting;
  res.status(200).send({
    greeting: random,
  });
});

app.post('/create-greeting', async (req, res) => {
  try {
    const greetReq = req.body.greeting;
    if (!greetReq) throw new Error('no greeting provided in request');
    const duplicate = database
      .collection('get-random-greeting')
      .where('greeting', '==', greetReq);

    if (duplicate) {
      res.status(200).send({ success: true });
      return;
    }

    const response = await database
      .collection('get-random-greeting')
      .add({ greeting: greetReq });
    res.json(response);
  } catch (e) {
    res.json({ error: e.message });
  }
});
