const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000;
const app = express()

const campaigns = [
  {
    title: "Help Fund a New App for Mental Health",
    campaignType: "Startup",
    description: "Develop an app that provides free mental health resources.",
    image: "https://i.ibb.co/QDjF0b4/image1.webp",
    deadline: new Date("2025-01-15"),
    raisedAmount: 12000,
    goal: 20000,
    minDonation: 700,
  },
  {
    title: "Medical Expenses for Surgery",
    campaignType: "Personal Issue",
    description: "Support John in covering unexpected medical bills for surgery.",
    image: "https://i.ibb.co/ZcyC8qR/image2.webp",
    deadline: new Date("2024-12-20"),
    raisedAmount: 7000,
    goal: 10000,
    minDonation: 800,
  },
  {
    title: "Launch a Sustainable Clothing Brand",
    campaignType: "Business",
    description: "Create eco-friendly and affordable clothing for everyone.",
    image: "https://i.ibb.co/BGvTFwy/image3.jpg",
    deadline: new Date("2025-02-10"),
    raisedAmount: 15000,
    goal: 30000,
    minDonation: 500,
  },
  {
    title: "Build a Community Library",
    campaignType: "Social Work",
    description: "Establish a library in a rural area to promote education.",
    image: "https://i.ibb.co/x5fHYG3/image-4.webp",
    deadline: new Date("2025-03-01"),
    raisedAmount: 5000,
    goal: 12000,
    minDonation: 500,
  },
  {
    title: "Documentary on Climate Change",
    campaignType: "Creative Ideas",
    description: "Raise awareness through a powerful documentary on climate impact.",
    image: "https://i.ibb.co/QpgzFfg/image5.jpg",
    deadline: new Date("2024-12-31"),
    raisedAmount: 8000,
    goal: 15000,
    minDonation: 800,
  },
  {
    title: "Startup: Smart Home Device",
    campaignType: "Startup",
    description: "Revolutionize home automation with an innovative smart home device.",
    image: "https://i.ibb.co/BqwdyHw/image6.webp",
    deadline: new Date("2025-01-25"),
    raisedAmount: 25000,
    goal: 50000,
    minDonation: 1000,
  },
  {
    title: "Clean Water for Villages",
    campaignType: "Social Work",
    description: "Provide access to clean water for remote villages.",
    image: "https://i.ibb.co/cJgsWvK/image7.webp",
    deadline: new Date("2025-02-05"),
    raisedAmount: 18000,
    goal: 25000,
    minDonation: 900,
  },
  {
    title: "Support Local Artisans",
    campaignType: "Business",
    description: "Help artisans sell their handmade products globally.",
    image: "https://i.ibb.co/12P0vyw/image8.webp",
    deadline: new Date("2024-11-01"),
    raisedAmount: 6000,
    goal: 10000,
    minDonation: 600,
  },
  {
    title: "Emergency Relief Fund for Flood Victims",
    campaignType: "Social Work",
    description: "Provide immediate assistance to families affected by floods.",
    image: "https://i.ibb.co/ccB4fPc/image9.webp",
    deadline: new Date("2024-11-20"),
    raisedAmount: 15000,
    goal: 20000,
    minDonation: 800,
  },
  {
    title: "Support a Local Theater Group",
    campaignType: "Creative Ideas",
    description: "Help a small theater group continue their performances.",
    image: "https://i.ibb.co/WDF1vVY/image10.jpg",
    deadline: new Date("2024-11-30"),
    raisedAmount: 4000,
    goal: 8000,
    minDonation: 500,
  },
];


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qcus7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;




const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    const campaignCollection = client.db('campaigns').collection('allCampaign')
    const donationCollection =client.db('campaigns').collection('userDonation')

        const existingData =await campaignCollection.find().toArray()
        if(existingData.length === 0){
            const result = await campaignCollection.insertMany(campaigns)
            console.log('Campaigns inserted:', result.insertedCount);
        }else{
            console.log('Campaigns already exist.');
        }

        app.get('/campaigns',async(req,res)=>{
            const result =await campaignCollection.find({deadline :{$gt:new Date()}}).limit(6).toArray()
            res.send(result)
        })

        app.get('/AllCampaign',async(req,res)=>{
          const result = await campaignCollection.find().toArray()
          res.send(result)
        })

        app.get('/AllCampaign/:id',async(req,res)=>{
          const id = req.params.id;
          const query = {_id :new ObjectId(id)}
          const result =await campaignCollection.find(query).toArray()
          res.send(result)
        })

        app.get('/donation/:email',async(req,res)=>{
            const email = req.params.email;
            const cursor = {email :email}
            const result =await  donationCollection.find(cursor).toArray()
            res.send(result)
        })

        app.post('/donation',async(req,res)=>{
          const donationData =req.body;
          const result = await donationCollection.insertOne(donationData)
          res.send(result)
        })

        app.post('/newCampaign',async(req,res)=>{
          const campaignData = req.body;
          const result = await campaignCollection.insertOne(campaignData)
          res.send(result)
        })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Give&Grow server is running')
})

app.listen(port,()=>{
    console.log('Give&Grow server is running on port',port)
})
