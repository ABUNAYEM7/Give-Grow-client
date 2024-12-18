const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
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



app.use(cors({
  origin:['http://localhost:5173','https://give-n-grow.web.app'],
  credentials:true
}))

app.use(express.json())
app.use(cookieParser())

const verifyToken =(req,res,next)=>{
  const token = req.cookies?.token
  if(!token){
    return res.status(401).send({message : 'unauthorized access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
    if(err){
      return res.status(401).send({message : 'unauthorized access'})
    }
    req.user = decoded
    next()
  })
}


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

    // await client.connect();

    const campaignCollection = client.db('campaigns').collection('allCampaign')
    const donationCollection =client.db('campaigns').collection('userDonation')

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

        app.get('/donation/:email',verifyToken,async(req,res)=>{
            const email = req.params.email;

            if(req.user.email !== email){
              return res.status(403).send('Forbidden Access')
            }

            const cursor = {email :email}
            const result =await  donationCollection.find(cursor).toArray()
            res.send(result)
        })

        app.get('/myCampaign/:email',verifyToken,async(req,res)=>{
          const email = req.params.email;
          if(req.user.email !== email){
            return res.status(403).send('Forbidden Access')
          }
          const cursor = {email: email}
          const result = await campaignCollection.find(cursor).toArray()
          res.send(result)
        })

        // cookie-signIn-post
        app.post('/jwt',(req,res)=>{
          const user = req.body;
          const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn : '1d'})
          res
          .cookie('token',token,{
            httpOnly : true,
            secure:process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict'
          })
          .send({success : true})
        })

        // clear-cookie-logout-post
        app.post('/logout',(req,res)=>{
          res 
          .clearCookie('token',{
            httpOnly :true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict'
          })
          .send({success : true})
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

        app.patch('/updateMyCampaign/:id',async(req,res)=>{
          const id = req.params.id;
          const query = { _id:new ObjectId(id)}
          const data = req.body;
          const updatedData={
            $set:{
              userName : data?.userName,
              email: data?.email,
              title : data?.title,
              description : data?.description,
              image :data?.image,
              deadline : data?.deadline,
              raisedAmount : data?.raisedAmount,
              goal : data?.goal,
              minDonation : data?.minDonation,
              campaignType : data?.campaignType
            }
          }
          const result = await campaignCollection.updateOne(query,updatedData)
          res.send(result)
        })

        app.delete('/deleteMyCampaign/:id',async(req,res)=>{
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const result = await campaignCollection.deleteOne(filter)
          res.send(result)
        })

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
