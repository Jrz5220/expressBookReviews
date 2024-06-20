const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // register a new user using the 'username' and 'password' provided in the body of the request
  let username = req.body.username;
  let password = req.body.password;
  let doesExist = (theUsername) => {
    let usersWithSameName = users.filter((user) => {
        return user.username === theUsername;
    });
    if(usersWithSameName.length > 0) {
        return true;
    }
    return false;
  }

  if(username && password) {
    if(!doesExist(username)) {
        users.push({"username": username, "password": password, "reviews": {}});
        return res.status(200).json({message: "User successfully registered."});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });
  getBooks.then((books) => {
    return res.status(200).json(books);
  }).catch((err) => {
    return res.status(500).json({message: "An error occured on the server", error: err.name});
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let getBookDetails = new Promise((resolve, reject) => {
        let isbn = req.params.isbn;
        let book = books[isbn];
        resolve(book);
    });
    getBookDetails.then((book) => {
        return res.status(200).json(book);
    }).catch((err) => {
        return res.status(500).json({message: "An error occured on the server", error: err.name});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let getBooksBasedOnAuthor = new Promise((resolve, reject) => {
        let author = req.params.author.toLowerCase().replace(/\s+/g, "");
        let booksByAuthor = [];
        for(let key in books) {
            if(books[key].author.toLowerCase().replace(/\s+/g, "") === author) {
                booksByAuthor.push(books[key]);
            }
        }
        resolve(booksByAuthor);
    });
    getBooksBasedOnAuthor.then((books) => {
        return res.status(200).json(books);
    }).catch((err) => {
        return res.status(500).json({message: "An error occurred on the server", error: err.name});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let getBookBasedOnTitle = new Promise((resolve, reject) => {
        let title = req.params.title.toLowerCase().replace(/\s+/g, "");
        let booksWithTitle = [];
        for(let key in books) {
            if(books[key].title.toLowerCase().replace(/\s+/g, "") === title) {
                booksWithTitle.push(books[key]);
            }
        }
        resolve(booksByAuthor);
    });
    getBookBasedOnTitle.then((books) => {
        return res.status(200).json({booksWithTitle: books});
    }).catch((err) => {
        return res.status(500).json({message: "An error occured on the server", error: err.name});
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // get book reviews based on ISBN
  let isbn = req.params.isbn;
  let bookReviews = books[isbn].reviews;
  return res.status(200).json(bookReviews);
});

module.exports.general = public_users;
