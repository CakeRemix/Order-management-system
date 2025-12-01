Donot forget to study tutorial slides 1 and tutorial slides 4 (specialy the inner join (last slide of tutorial))
Before running the project 

1. you are required to download nodejs, postgres sql and visual studio code
2. open pgadmin4 then register server
3. enter db_server for Name field 
4. click on connection and type password in password field and enter localhost in host name field

Note that you need to use same password that you used during installing postgres sql.

5. click on save
6. go to db_server then Database then postgres then click on schemas
7. click on icon next to Browser (Top left)
8. create new schema backendProject in postgres Database
9. click on query tool 
   go to scripts.sql inside folder connectors
   then copy all tables to query tool and execute/run query 

10. open project through visual studio code
11. click on terminal then click new terminal
12. type command npm install axios express knex pg uuid hjs dotenv in terminal
13. type command npm install nodemon --save-dev
14. go to .env
15. change PASSWORD from 123 to the same password that you used during installing postgres sql 
16. run code using command npm run server or node server.js from terminal

Also click on visual studio code extensions then search for thunder client then install it to test your backend
(clicking ctrl + c to stop runnning server code exit by clicking)