exports.globelError=(error,req,res,next)=>{
    console.log(error.message)
    res.status(404).json({
        "error":error.message
    })

}
