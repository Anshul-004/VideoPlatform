//using promise, we can use try , catch as well , but need higher order func. () => () => {}
const asyncHandler = (reqHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqHandler(req,res,next)).
        catch( (err) => {next(err)} )
    }
}

export {asyncHandler}