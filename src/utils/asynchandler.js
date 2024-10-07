const asynchandler=(requestHandlers)=>{
    (req,res,next)=>{
        promise.resolve(requestHandlers(req,res,next).catch((err) => {next(err);}))
    }
}


export default asynchandler();