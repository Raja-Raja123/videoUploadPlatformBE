const asyncHandeler = (fun)=>{
   async (req,res,next)=>{
       try {
          await fun(req,res,next)
       } catch (error) {
          res.status(error.code || 500).json({
            succes: false,
            message: error.message
          })
       }
   }
}

const asynchandeler = (requestHandeler)=>{
  (req,res,next) =>{
      Promise.resolve(requestHandeler(req,res,next)).catch((err)=>next(err))
  }
}

export default asyncHandeler;
