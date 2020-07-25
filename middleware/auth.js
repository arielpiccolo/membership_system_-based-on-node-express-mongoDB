const { promisify } = require("util");
// importing Schema
const User = require('../models/user');
// variable jwt imports jsonwebtoken
const jwt = require('jsonwebtoken');


//                                     next is to use with the middleware only
exports.isLoggedin =  async( req, res, next) => {

    // if our cookie is true
    if( req.cookies.jwt) {
        {
        // variable store decoded cookie / using promisify() function from JS module.
        // also .verify will check is the pass stored matched our token in our cookie
        //          promisify func /   jwt is our token / then access the cookie / and check against JWT_SECRET
        const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET); 
        //  testing the decoded cookie
        console.log(decode);


        const theUser = await User.findById(decode.id);

        console.log(theUser);

        // when inside of the middleware one can create variables by using the req like in the following code
        // stored the founded user
        req.userFounded = theUser;


        }


    }
    
    // when next is called the middleware ends
    next();

}

// this function will handled the logout
exports.logout = (req, res, next) => {

    // this will replace our user cookie with another cookie 'logout' 
    res.cookie('jwt', 'logout', {

        expires: new Date( Date.now() + 2*1000),
        httpOnly: true
    })
     
    next();
} 





// ! notes

// ? success login
// ! decoded login
// { id: '5f0f11bfe2e2e65efc3473a4', iat: 1594860883, exp: 1602636883 }
// {

// ! user details
//   _id: 5f0f11bfe2e2e65efc3473a4,
//   name: '

//   email: 'pepe@email.com',
//   password: '$2a$08$Ds4MtZl575GymFokP6u/zeEgJhc8GVrEWedTXDeBcyG5HNTfPzMJu',
//   __v: 0
// }