# Super Startup Library

Superstartup is a Javascript library that helps startups focus on what really matters for them. It does so by providing a robust, flexible and well tested solution on these high level tasks:

* **User Authentication** External authentications (FB, Twitter, oAuth2...), data object management, query for users, manage users and all that jazz.
* **Metrics** Intelligent set of libraries that help penetrate on visitors' behavior, conversions, regency and any small or big metric that needs to be measured.
* **Social Tools** Sharing widgets, mechanisms and integrations for all the major social networks, wired to the metrics libraries for a crystal clear view on what is happening and where it happens in your site.

Build to be framework and server API agnostic, superstartup will integrate seamlessly with any technology stack you may have.

## Status

Still under heavy development, designing the API, deep wiring and grinding. A great time to pop in and [help steer the project](https://github.com/thanpolas/superstartup/blob/master/backend/Docs/ssAPI.md).

In the meantime please check the libraries that sprang out and are the foundations of Superstartup:

* **[ready.js](https://github.com/thanpolas/server2js)** Watch multiple async operations and trigger listeners when all are complete.
* **[server.js](https://github.com/thanpolas/server2js)** Transfer data objects from server to javascript on page load.
* **[Grunt Closure Tools](https://github.com/thanpolas/grunt-closure-tools)** [Google Closure](https://developers.google.com/closure/library/) DepsWriter, Builder and Compiler tasks for grunt.
* **[Google Closure Library Boilerpate](https://github.com/thanpolas/closure-boilerplate)** The Google Closure Library boilerplate. Checkout, start working.


## Technology Stack

Superstartup is being developed using the [Google Closure Library](https://developers.google.com/closure/library/), achieving maximum performance, extensibility and utilizing the powerful [Closure Compiler](https://developers.google.com/closure/compiler/) to generate the smallest possible size a JS lib can have.

To help with automating build tasks, the awesome [Grunt](https://github.com/cowboy/grunt#readme) is used.

