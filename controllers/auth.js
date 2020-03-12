exports.signup = (req, res) => {
    console.log('req body on signup', req.body)
    res.json({
        data:'you hit signup end point yay'
    })
}