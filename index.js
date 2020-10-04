const express = require('express');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhwgi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

const port = 5000


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const volunteerCollection = client.db("volunteerNetworkDB").collection("volunteringWork");
  const loggedInUserCollection = client.db("volunterNetworkDB").collection("userCollection");
  
  app.post('/addUserEvent', (req, res) => {
      const events = req.body;
      loggedInUserCollection.insertOne(events)
      .then(result => {
          res.send(result.insertedCount);
      })
  })

  app.get('/events', (req, res) => {
      volunteerCollection.find({})
      .toArray((err, documents) =>{
          res.send(documents);
      })
  })

  app.get('/userEvents', (req, res) => {
    loggedInUserCollection.find({})
    .toArray((err, documents) =>{
        res.send(documents);
    })
})
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)