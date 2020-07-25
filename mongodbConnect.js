//! <<<<<<<<<<<<<<<<<<<<<<<<<<<<<imports and settings>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth.js');
const User = require('./models/user');
const viewsPath = path.join(__dirname, './views');
const partialPath = path.join(__dirname, './views/inc');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { symlink } = require('fs');
// const { exec } = require('child_process');
// const { create, countDocuments } = require('./models/user');
// const { isLoggedin } = require('./middleware/auth');


app.use(express())
dotenv.config({ path: './config.env' })
app.use(express.urlencoded());
app.use(express.json());
// these was imported before at the top of the page
app.use(cookieParser());

// app.use(express.static("./public"));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
app.set('views', viewsPath);

hbs.registerPartials(partialPath);
app.use(bodyParser.urlencoded({ extended: true }));

// error catch
// passing credentials from config.env file
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => console.log('Mongodb is Connected!'));
// !====================================================================================















//?<<<<<<<<<<<<<<<<<<<<<<<<<<< route to home page>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


app.get('/', async (req, res) => {

    // req a list of all users using find, find will bring back all the users
    // async and await are used to tell JS to wait for this task to be completed before move onto the next task.
    const allUsers = await User.find();
    // console.log(allUsers);

    res.render('landingPage', {
        activeUsers: allUsers
    
    });

})


// * ============login form============
// async function
app.post("/", async (req, res) => {

    const name = req.body.userName;
    const email = req.body.userEmail;
    const password = req.body.userPassword;
    const passwordAgain = req.body.confirmPassword

    // hashing password using bcryptjs package
    // the input password from above(from register form) is passed onto a new variable(hashedPass) and encrypted using .hash 8 rounds or hashed on it self 8 time. 
    const hashedPass = await bcrypt.hash(password, 8);
    const userDetails = await User.find({email: email});
    const Email = userDetails;
    const passMatched = password === passwordAgain;

    if (passMatched) {

        if (userDetails.length > 0) {
            res.send('User already registered')
        } else {
            await User.create(
                {
                    name: name,
                    email: email,
                    password: hashedPass
                }
            );
            res.render('registered', {
            SEND : Email + "Registered"
            })
        }

    } else {
        res.send("Password do not matched");
    };    

}); 


//*===================================================================================


//? <<<<<<<<<<<<<<<<<<<<<<<<<<Update Page>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get('/update', (req, res) => {
    res.redirect('landingPage');
});



app.post('/update', async (req, res) => {
    
    const currentPassword = req.body.thisPassword;
    const thisEmail = req.body.thisEmail;
    const thisName = req.body.thisName;
    const newName = req.body.upName;
    const newEmail = req.body.upEmail;
    const newPassword = req.body.upPassword;
    const fetchUserByEmail = await User.find({email: thisEmail});
    const hashedPass = await bcrypt.hash(newPassword, 8);


    if ( fetchUserByEmail.length > 0) {

        const passMatched = await bcrypt.compare(currentPassword, fetchUserByEmail[0].password);

        if ( passMatched ) {
            const passUntouched = await bcrypt.hash(currentPassword, 8);


            if ( newName) {

                await User.findOneAndUpdate({
                
                    name: newName,
                    email: thisEmail,
                    password: passUntouched
                
                });
                     
                res.render('updated', {

                    message: `Your name was updated Successfully!`
                }); 
            
            } 
            
            if ( newEmail ) {

                await User.findOneAndUpdate({

                    email: newEmail,
                    name: thisName,
                    password: passUntouched

                });

                res.render('updated', {

                    message: `Your email was updated Successfully!`

                });
            
            }
            
            if ( newPassword ) {

                await User.findOneAndUpdate({

                    name: thisName,
                    email: thisEmail,
                    password: hashedPass

                });

                res.render('updated', {

                    message: `Your password was Successfully updated`
                });
            }




            
       
        } else {
            res.render('404', {

                message: `Sorry Wrong credentials, click 'Home' and try again`
            });
        };
    
    
    
    } else {
        res.render('404', {

            message: `If this email is registered please check your credentials and try again`

        });    };

    
    



    


    // if ( passMatched ) {
    //     const passMatched = await bcrypt.compare(currentPassword , thisEmail[0].password);

    //     const findOne = await findOneAndUpdate(thisEmail[0].id)
    //     console.log(findOne);
    // }


 





    // if (thisEmail.length > 0) {
    //     const passMatched = await bcrypt.compare(currentPassword , thisEmail[0].password);
    //     console.log(thisEmail);

    //     if (passMatched) {

    //         await User.findOneAndUpdate(thisEmail, {
    //             name: newName,
    //             // email: newEmail,
    //             // password: newPassword
    //         })
        
    //     } else {
    //         res.render('404');
    //     }
     
    //     res.send("User updated");
    // } else {
    //     res.render('404');
    // }    
});










 app.get('/logout', auth.logout, (_req, res) => {
     res.render('exit', {
     })
});
//*==============================================================================


// //?<<<<<<<<<<<<<<<<<<<<<<<<< REGISTERED PAGE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get('/goProfile', (_req, res) => {
    res.redirect('goProfile')
})

app.post('/goProfile', (_req, res) => {
    res.redirect('profile')
})


app.get('/exit', (_req, res) => {
    res.render('registered')
})

app.post('/exit', (_req, res) => {
    res.redirect('logout')
})




//?<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Login Page >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
app.get('/login', (_req, res) => {
    res.render("profile");
})

// dealing with login form
app.post("/login", async (req, res) => {

    // grab login input from user in login form(login.hbs)
    const email = req.body.userEmail;
    const password = req.body.userPassword;


    // checking credentials
    //   input user / check on User Schema / find email
    const user = await User.find({ email: email });


    if (user.length > 0) {


        // this variable will compare the input password at login with the hashed password in the database using the .compare function from bcryptjs
        const Matched = await bcrypt.compare(password, user[0].password);
        // log the matched user for testing
        console.log(user[0].password);
        console.log(Matched);


        if (Matched) {

            // next variable to store token cookie
            // if the cookie jwt is true .sing function  / querying data  / passing secret word   and     expiresIn details from config.env
            const token = jwt.sign({ id: user[0]._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });


            console.log(token);


            // cookie management
            const cookieOptions = {
                // variables = new date / + importing cookies options from config.env file
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            }

            // rending cookie + token + cookieOptions to the browser
            res.cookie('jwt', token, cookieOptions);
            // then
            res.render('profile') 

        } else {
            res.render('404');
        }



    } else {
        res.render('404');

    }


});


// *======================================================================================================================


// ? <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Profile>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// profile route
//  using middleware / middleware acts as a middle man running whatever code before rending the page
// isLoggedin is imported from ./middleware folder
app.get('/profile', auth.isLoggedin ,(req, res) => {
    
    // req.userFounded is a variable in auth js containing the user details
    if( req.userFounded ) {

        // then render his profile
        res.render("profile", {

            // rending the users name to the page
            name: req.userFounded.name
        });

        // else back to login page
    } else {
        res.redirect('/login');
    }

});
// *====================================================================================================================


// ?<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Delete>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


app.get('/delete', (req, res) => {
    res.redirect('landingPage');
});



app.post('/delete',async (req, res) => {
    const formPassword = req.body.thisPassword;
    const formEmail = req.body.thisEmail;
    const fetchUsersEmail = await User.find({email : formEmail});
    

    if (fetchUsersEmail.length > 0) {
        const passMatched = await bcrypt.compare(formPassword , fetchUsersEmail[0].password);

        if (passMatched) {

            await User.findOneAndDelete(formEmail);

            res.render('deleted', {
                message: `The user with the registered email >> ${formEmail} << has been Successfully deleted.`
            })
        
        } else {
            res.render('404')
        }
    } 
});


// ?>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>





// *===========================================================================================================================





//         config.env folder + port
app.listen(process.env.PORT, () => (console.log(`Server is running @port ${process.env.PORT}`)))















// ! NOTES
    // !      user id              /  cookie issued    /   cookie expires  show in ms
// { id: '5f0f11bfe2e2e65efc3473a4', iat: 1594860883, exp: 1602636883 }


//     //? the next code is just another way to do the above.
//      const { userName, userEmail, userPassword} = req.body;
// });
//  ? =====================================






// app.post("/register", async (req, res) => {

//      this function will access the database and create the following entries. 
//     await User.create ({
//         name: "john",
//         email: "john@email.com",
//         password: "password"
//     });
//      then render this message to the page
//     res.send("User Registered");
// });
//  ? =====================================

    // log all the user to the console
    // targeting only name of user user 1
    // console.log(allUsers[1].name) or
    // const user = await User.find({name: "Ariel"});  <<- name or email or whatever
    // const user = await User.findById("5f0e4231abc4750205782eb7");

    // render this message to the page