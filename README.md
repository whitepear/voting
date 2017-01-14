This project is live at: https://free-vote.herokuapp.com/

Responsively-designed full-stack application that allows users to create and vote on persistent polls. Authenticated users can create polls with any number of options, or add new options to existing polls. Poll results are rendered in chart form, through the use of Chart.js.

The foundation of the server-side functionality is implemented in Express.js. Views are rendered by the Pug (formerly known as Jade) template engine, whilst a single MongoDB collection handles persistent storage. The app utilises the Mongoose ODM to implement a database schema, and to manage a significant portion of database-associated validation. Express-Session and Connect-Mongo manage session-storage within the database. User passwords are hashed and salted using bcrypt, whilst all user input is sanitized via Sanitize-Html. Sass is primarily used for the modular organisation of app-related stylesheets.

Note: The live application (linked above) is hosted on Heroku. Please allow a few seconds for the hosting server to wake up when attempting to view it.
