const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtjw1lo.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('assignment 10 server is running...')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('assignment-10')
        const courseCollection = db.collection('courses');
        const categoryCollection = db.collection('categories');
        const enrolementCollection = db.collection('enrolements');
        const topInstructors = db.collection('topInstructors');

        // GET: all the categories
        app.get('/categories', async (req, res) => {
            const cursor = categoryCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET: Popular courses
        app.get('/popular', async (req, res) => {
            const cursor = courseCollection.find().sort({ rating: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // POST: new course publish (Create)
        app.post('/courses', async (req, res) => {
            const newPost = req.body;
            const existing = await courseCollection.findOne({ title: newPost.title });
            if (existing) {
                return res.status(409).send({ message: 'Course already exists.' });
            }
            const newCourse = req.body;
            const result = await courseCollection.insertOne(newCourse);
            res.send(result);
        })

        // GET: get all the courses (Read)
        app.get('/courses', async (req, res) => {
            const { category, email } = req.query;

            const filter = {};
            if (category) {
                filter.category = category;
            }
            if (email) {
                filter.ownerEmail = email;
            }

            const cursor = courseCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET: individual courses
        app.get('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await courseCollection.findOne(query)
            res.send(result);
        })



        // PATCH: update an existing product (Update)
        app.patch('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCourse = req.body;
            const query = { _id: new ObjectId(id) };

            const update = {
                $set: updatedCourse,
            }

            const result = await courseCollection.updateOne(query, update);
            res.send(result);
        })

        // DELETE: delete a existing course (Delete)
        app.delete('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await courseCollection.deleteOne(query);
            res.send(result);
        })

        // POST: My Enrolements
        app.post('/enrolements', async (req, res) => {
            const newEnrolement = req.body;

            const existing = await enrolementCollection.findOne({ title: newEnrolement.title });

            if(existing){
                return res.status(409).send({ message: 'Course already exists.' });

            }

            const result = await enrolementCollection.insertOne(newEnrolement);
            res.send(result);
        })

        // GET: My Enrolements
        app.get('/enrolements', async (req, res) => {
            const { email } = req.query;

            const filter = {};

            if (email) {
                filter.enroledBy = email;
            }

            const cursor = enrolementCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result);
        })

        // DELETE: delete an enrolement
        app.delete('/enrolements/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await enrolementCollection.deleteOne(query);
            res.send(result);
        })

        // GET: top instructors
        app.get('/topInstructors', async (req, res) => {
            const cursor = topInstructors.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // POST: top instructors
        app.post('/topInstructors', async (req, res) => {
            const newInstructor = req.body;
            const result = await topInstructors.insertOne(newInstructor);
            res.send(result);
        })


        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`assignment 10 server is running on port: ${port}`)
})