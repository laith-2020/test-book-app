'use strict';

require('dotenv').config();

const express = require('express');
const server = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
server.use(methodOverride('_method'));


const client = new pg.Client(process.env.DATABASE_URL);

server.use(cors());
server.use(express.static('./public'));
server.set('view engine', 'ejs');

server.use(express.json());
server.use(express.urlencoded({ extended: true }));


server.put('/updateData/:id', updateFun);

function updateFun(req, res) {
    let { author_name, title, publisher, isbn, language } = req.body;
    let id = req.params.id;

    let SQL = `UPDATE book SET author_name=$1,title=$2,publisher=$3,isbn=$4,language=$5 WHERE id=$6;`;
    let safeValues = [author_name, title, publisher, isbn, language, id];
    client.query(SQL, safeValues)
        .then(result => {
            res.redirect(`/details/${id}`);
        })
}


server.delete('/delete/:id', deleteFun);

function deleteFun(req, res) {
    let id = req.params.id;
    let SQL = `DELETE FROM book WHERE id=$1;`;
    let safeValue = [id];
    client.query(SQL, safeValue)
        .then(() => {
            res.redirect('/');
        })

}

server.get('/details/:id', (req, res) => {

    let safeValue = [req.params.id];
    let SQL = `SELECT * FROM book WHERE id=$1;`;
    client.query(SQL, safeValue)
        .then(result => {
            console.log(result.rows);
            res.render('pages/searches/details', { resultKey: result.rows });
        })

})


server.get('/new', (req, res) => {
    res.render('pages/searches/new.ejs');
})

server.post('/search', getDataApi);

function getDataApi(req, res) {
    // console.log(req.body);
    let searchBy = req.body.by;
    let searchFor = req.body.bookName;
    let URL;
    if (searchBy == 'title') {

        URL = `http://openlibrary.org/search.json?title=${searchFor}`;
    } else {
        URL = `http://openlibrary.org/search.json?author=${searchFor}`;

    }
    superagent.get(URL)
        .then(result => {

            let dataResult = result.body.docs.map(item => {

                let bookOBJ = new Book(item);
                return bookOBJ;
            })
            let arr = [];
            for (let i = 0; i < 10; i++) {
                arr.push(dataResult[i]);
            }
            // console.log('dataaaaaaaaaa', dataResult);
            res.render('pages/searches/show', { resultKey: arr });

        })
}


server.get('/', getBookData);

function getBookData(req, res) {
    let SQL = 'SELECT * FROM book;';
    client.query(SQL)
        .then(results => {
            res.render('pages/index', { resultsKey: results.rows });
        })
        .catch(error => errorHandler(error));
}


function errorHandler(error, req, res) {
    res.status(500).send(error);
}


server.post('/showaddform', addToDataBase);

function addToDataBase(req, res) {

    let { author_name, title, publisher, isbn, language } = req.body;
    let SQL = ` INSERT INTO book(author_name,title,publisher,isbn,language) VALUES ($1,$2,$3,$4,$5);`;
    let values = [author_name, title, publisher, isbn, language];
    // console.log('values', values);
    // console.log('SQL', SQL);
    client.query(SQL, values)
        .then(() => {
            console.log(req.body);
            res.redirect('/');
        })
}

function Book(bookData) {
    this.author_name = bookData.author_name;
    this.title = bookData.title;
    this.publisher = bookData.publisher ? bookData.publisher[0] : 'publisher undefined';
    this.isbn = bookData.isbn ? bookData.isbn[0] : ' isbn not found';
    this.language = bookData.language;
}

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`lestening on port ${PORT}`);
        })

    })