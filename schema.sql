DROP TABLE IF  EXISTS book;
CREATE TABLE  book(
    id SERIAL PRIMARY KEY,
    author_name  VARCHAR(255),
    title VARCHAR(255),
    publisher VARCHAR(255),
    ISBN VARCHAR(255),
    language VARCHAR(255)

)
