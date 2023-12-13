class ApiError extends Error{
    constructor(error,stutsCode){     
        super(error)
        this.statusCode=stutsCode;
        this.status=stutsCode.toString().startsWith(4)?"fail":"error";
        this.isOperation=true

    }

}


module.exports=ApiError