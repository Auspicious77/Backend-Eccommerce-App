
const expressJwt = require('express-jwt')

//expressjwt is used to check if user has a token or not inoder to have access to the token
//to secure our server
//https://jwt.io/
//isRevoked is function used to specify if the user is admin or not

function authJwt() {
    const secret = process.env.secret
    const api = process.env.API_URL
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            //to allow user access the products but limited to posting products
            //regular expression alows to specify everything that comes after products 
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/orders(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
            `${api}/v1/users/login`,
            `${api}/v1/users/register`,
        ]
    })
}
// payload = data in the token
//  not admin will be regected
async function isRevoked(req, payload, done){
    if (!payload.isAdmin) {
        done(null, true)
    }
    done();
}

//unless method is used to exclude the apis from authentication

module.exports = authJwt;


//Admin
//elishaibukun
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmViNzE2OWQ0YWMxMDE0YTdhZTYyMWMiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE2NTk2MTE3Njh9.4npHHvhq5KcQH98xVxzskHGB592z5ztHDxcoIrIsmMk

//non admin
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmViYWNmM2JjMzc3NjIzYzZhZjViNmQiLCJpYXQiOjE2NTk2MTI0Njh9.SjmfywUfbPK6mQT30K9bZ6gnPTvWbfy82jaHCHQaDrY
//auspicious