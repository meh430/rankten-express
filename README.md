# Rank 10 Express 

<img src="https://raw.githubusercontent.com/meh430/rankten-flutter/master/screens/ranktenlogo.png" align="right" width="80">

Rank 10 is a platform that allows users to create and share top ten lists on any topic. This repository is a RESTful API for Rank 10 built using Express, MySQL, and Redis.

Check out the web client [here](https://github.com/meh430/rankten) and the mobile client [here](https://github.com/meh430/rankten-flutter)!

## Features
- Create and customize an account with a profile picture and a bio that can display interests
- Easily create and edit top ten lists that are either private or public
- Drag and drop to quickly reorder rankings within your list
- Follow other users with similar interests to see what lists they create
- Discover new lists
- Search for lists on topics that interest you
- Like lists that catch your interest to have quick access to them through your profile
- Comment on lists
- Dark mode

## Running Locally
This project has been dockerized to allow for a relatively painless setup.  You will need Docker and Git installed on your machine.

First clone the project onto your machine. If on Windows, make sure to run the following command to clone instead:
```
git clone https://github.com/meh430/rankten-express.git --config core.autocrlf=input
```
Cd into the project directory and create a .env file with the following content:
```
JWT_SECRET=CREATE YOUR OWN
JWT_ALGO=HS256

MYSQL_HOST=db
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_DATABASE=rank_ten

REDIS_URL=redis://redis:6379

PORT=3000
```
Finally, run the following command to run the app:
```
docker-compose up --build
```
The api should be accessible at localhost:3000
