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
  if(req.session.authorization) {
    let token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
        if(err) {
            return res.status(403).json({message: "User not authenticated"});
        }
        // store review with the user
        let verifiedUser = users.filter((u) => {
            return u.password === user.data;  // the password of the authenticated user
        });
        // verifiedUser.length should never be 0
        if(verifiedUser.length > 0) {
            if(verifiedUser[0].reviews[isbn]) {
                // replace old book review
                verifiedUser[0].reviews[isbn] = review;
            } else {
                // store new book review
                let storeNewUserReview = {
                    ...verifiedUser[0].reviews,
                    [isbn]: review
                }
                verifiedUser[0].reviews = storeNewUserReview;
            }
        } else {
            return res.status(500).json({message: "The server was unable to verify the user"});
        }
        // store review with the book
        let duplicateUserReview = books[isbn].reviews[verifiedUser[0].username];
        if(duplicateUserReview) {
            // replace old user book review
            books[isbn].reviews[verifiedUser[0].username] = review;
        } else {
            // add new user review
            let storeNewBookReview = {
                ...books[isbn].reviews,
                [verifiedUser[0].username]: review
            }
            books[isbn].reviews = storeNewBookReview;
        }
        return res.status(200).json({message: "Successfully added review.", bookTitle: books[isbn].title, bookReview: books[isbn].reviews});
    });
  } else {
    return res.status(403).json({message: "User not logged in"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    // delete reviews based on the session username
    let isbn = req.params.isbn;
    if(req.session.authorization) {
        let token = req.session.authorization["accessToken"];
        jwt.verify(token, "access", (err, user) => {
            if(err) {
                res.status(403).json({message: "User not authenticated"});
            }
            let verifiedUser = users.filter((u) => {
                return u.password === user.data;
            });
            try {
                delete verifiedUser[0].reviews[isbn]; // verifiedUser should never be empty
                delete books[isbn].reviews[verifiedUser[0].username];
                res.status(200).json({message: "Successfully deleted review", user: verifiedUser[0], book: books[isbn]});
            } catch(e) {
                return res.status(500).json({message: "A server error prevented the user from being authenticated", error: e.name});
            }
        });
    } else {
        res.status(403).json({message: "User not logged in"});
    }
});

// for testing
regd_users.get("/users", (req, res) => {
    return res.status(200).json({users: users});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
