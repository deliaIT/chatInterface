# Project-Chats

This is a chat app, shows a demo for two windows chatting.
It contains both front-end and back-end

Front-end technology:
Angular, Bootstrap, jQuery, HTML, CSS, JavaScript

Backend technology:
Node.js express, Handlebars

Bundle Tools:
Webpack, please run build before starting the server

Features:
Chat header shows other's users' typing status
Only fetching newer messages to improve performance
Automatically scrolling
Fit different size of screen
Data object design in the back-end is highly scallable
Data objects are well designed using JavaScript only, sensitive data can only be accessed by getter and setter
Handlebars templates are prepared to build other applications


How-to:
clone the repository to local
$npm install
$npm run build 
$npm start or using $nodemon if preferred
Access url localhost:3000/
enjoy!


Need to mention
The "Stop" button is for testing purpose only
It will stop the background service
Node version should support ES2015
Chat is a component so it's easy to separate chats. In index.hbs, only config one chat directive.
Add bundle.js in this code in case user forget to run webpack build. 
