const mongoose =require("mongoose")



const db_connect=()=>{
   mongoose.set('strictQuery', true);
    mongoose.connect(process.env.DB_URI).then((d)=>{
        console.log("goooooood")

     }).catch((error)=>{
        console.log(error)
     })
}

module.exports=db_connect