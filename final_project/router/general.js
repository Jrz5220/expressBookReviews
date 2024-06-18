const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // get list of books available in the shop
  // use JSON.stringify to display the output neatly
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // get book details based on ISBN
  let isbn = req.params.isbn;
  let book = books[isbn];
  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // get book details based on the author
  let author = req.params.author.toLowerCase().replace(/\s+/g, "");
  let booksByAuthor = [];
  for(let key in books) {
    if(books[key].author.toLowerCase().replace(/\s+/g, "") === author) {
        booksByAuthor.push(books[key]);
    }
  }
  return res.status(200).json({booksByAuthor: booksByAuthor});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // get book details based on the title
  let title = req.params.title.toLowerCase().replace(/\s+/g, "");
  let booksWithTitle = [];
  for(let key in books) {
    if(books[key].title.toLowerCase().replace(/\s+/g, "") === title) {
        booksWithTitle.push(books[key]);
    }
  }
  return res.status(200).json({booksWithTitle: booksWithTitle});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
