class ApiError extends Error{
    constructor(statuscode,message="something went wrong ",error=[],stack=""){
        super(message)
        this.statusCode=statuscode
        this.error=error
        this.stack=stack
        this.data=null
        this.success=false



        if(stack){
            this.stack=stack
        }else{
            error.captureStackTrsace(this,this.constructer)
        }
    }
}

export default ApiError;