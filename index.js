const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhwgi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

const admin = require('firebase-admin');
var serviceAccount = require("./configs/volunteer-network-by-sarwar-firebase-adminsdk-tkyqn-3ce667e9be.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://volunteer-network-by-sarwar.firebaseio.com"
});

const port = 5000;


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
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/events', (req, res) => {
        const events = req.body;
        volunteerCollection.insertOne(events)
        .then(result => {
            res.send(result.insertedCount);
        })
    })

    app.get('/adminEvents', (req, res) => {
        loggedInUserCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/userEvents', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        loggedInUserCollection.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else{
                        res.status(401).send('Unauthorized access');
                    }
                    // ...
                }).catch(function (error) {
                    res.status(401).send('Unauthorized access');
                });
        }
        else{
            res.status(401).send('Unauthorized access');
        }
    })

    app.delete('/delete/:id', (req, res) => {
        loggedInUserCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then((result) => {
            console.log(result);
        })
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)