const Express= require('express');
const app= Express();
const mongoose= require('mongoose');
const port= process.env.MONGO_URI ||3000;
const bodyParser= require('body-parser');
const moment = require('moment');

app.use(bodyParser.urlencoded({extended: true}));
const cors= require('cors');
app.use(cors());
//connecting to the mongoDb cluster
require('dotenv/config');
const uri= process.env.MONGO_URI;
mongoose.connect(uri, {useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false},()=>{console.log('connected!!')});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once("open", () => {
 console.log("MongoDB database connection established successfully");
})
//importing schema
var  userData=  require('./module/schema.js');

//importing static files
app.use('/public', Express.static(process.cwd() + '/public'));

app.get('/', async function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
 
});

app.post('/api/exercise/new-user',async (req,res) => {
    
    var username= req.body.username;
   //check if user already exist 
  
   try{
       findone= await userData.findOne(
           {username:username}
       )
       if(findone){
           res.json("username already taken")
       }else{
           //creating new user 
                const user= new userData({
                    username:username
            })
            await user.save()
            res.json({
                username:user.username,
                _id: user._id
            })
       }
   }catch(error){
       res.json({error:error})
   } 

})
//add exercice to api/execise/add
   
app.post('/api/exercise/add',async (req,res)=>{

    var userId= req.body.userId;
    var description= req.body.description;
    var duration= req.body.duration;
    var date= (req.body.date)?new Date(req.body.date):Date.now();
        
    console.log("Submitted date: "+req.body.date);
    console.log("Created date: "+date); 
    try {

        // callback function required to save data simultaneously
         await userData.findOne({_id:userId},(err,doc) => {
            if(doc){
                doc.logs.push({
                    description:description,
                    duration:duration,
                    date:new Date(date).toDateString()
                })

                doc.save(function(err) {
                    err != null ? console.log(err) : console.log('Data updated')
                  })
                  res.json({
                      username:doc.username,
                      description:doc.logs[doc.logs.length-1].description,
                      duration:doc.logs[doc.logs.length-1].duration,
                      date:new Date(doc.logs[doc.logs.length-1].date).toDateString(),
                      _id:doc._id
                  })
            }  else{
                res.send("incorrect user id")
            }
        })       
        }catch (error) {
        res.json({error:'error'})
    }
            

})



//get array of users 
app.get('/api/exercise/users',(req,res)=>{
    userData.find({}, '-logs')
    .exec()
    .then(docs => res.json(docs))
    .catch(err => res.json({ error: err }));
})
  
//getting users logs
app.get('/api/exercise/log',(req, res) => {
   var {userId,from,to,limit} = req.query;
    userData.findById(userId, (err,doc)=>{
        
        if(doc){
            from= new Date(from);
            console.log(from);
            console.log(doc.logs[0].date)     

    }
});
});




app.listen(port,function(){console.log(`listning on port ${port}`)});