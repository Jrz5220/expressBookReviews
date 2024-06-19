const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // returns boolean
    // write code to check is the username is valid
    let usersWithSameName = users.filter((user) => {
        return user.username === username;
    });
    if(usersWithSameName.length > 0) {
        return false;
    }
    return true;
}

const authenticatedUser = (username, password) => {
    //returns boolean
    //write code to check if username and password match the one we have in records.
    let isAuthenticatedUser = false;
    for(let i = 0; i < users.length; i++) {
        if(users[i].username === username && users[i].password === password) {
            isAuthenticatedUser = true;
            break;
        }
    }
    return isAuthenticatedUser;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    // save the user's credentials for the session as a JWT
    let username = req.body.username;
    let password = req.body.password;
    if(authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, "access", { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({message: "User successfully logged in."});
    } else {
        return res.status(400).json({message: "Invalid login. Check username and password."});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // review is given as a request query and must get posted with the username posted (stored in the session).
  // if the same user posts a different review on the same ISBN, it should modify the existing review.
  // if another logged in user posts a review on the same ISBN, it will get added as a different review.
  let isbn = req.params.isbn;
  let review = req.body.review;
  let username = req.body.username;
  if(req.session.authorization) {
    let token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
        if(err) {
            return res.status(403).json({message: "User not authenticated", user: username});
        }
        // store the review with the user
        user.reviews[isbn] = review;    // TypeError: Cannot set properties of undefined
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: "Successfully added review.", user: username});
    });
  } else {
    return res.status(403).json({message: "User not logged in.", user: username});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
