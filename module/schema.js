const express = require('express');
const mongoose= require('mongoose');
const schema= mongoose.Schema;
const userData= new schema({
    username:{
        type:String,
        required:true    
    },
    logs:{type:[
        {
            description:String, 
            duration:Number, 
            date:Date
        }
    ],default:[]}  


    });
const data= mongoose.model("data", userData);
module.exports=data; 