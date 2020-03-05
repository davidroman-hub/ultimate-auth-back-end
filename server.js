const express = require('express')
const app = express()
const morgan =require('morgan')// for look in the console the method that we have(get, put, etc...)
const cors = require('cors')// if you want to connect at the app at willl be run at the port 3000
const bodyParser = require('body-parser')// for send the data to  maybe post mand and to have a response
const mongoose = require('mongoose')
require('dotenv').config()// acces to the variables in .env

// connect mongoDB (database)

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useFindAndModify:false,
    useUnifiedTopology:true,
    useCreateIndex:true
})
.then(()=> console.log('DB connected'))
.catch(err => console.log('DB FAILED ERROR:', err))





//import routes
const authRoutes = require('./routes/auth')


//app middlewares
app.use(morgan('dev')); 
app.use(bodyParser.json());
// app.use(cors());// allowa all origins to accede to react etc..
if(process.env.NODE_ENV = 'development'){
    app.use(cors({origins:`http://localhost:3000`})); 
}



//middlewares
app.use('/api/', authRoutes);

const port = process.env.PORT || 8000 
app.listen(port, () => {
    console.log(`API running on port ${port}`)
})



