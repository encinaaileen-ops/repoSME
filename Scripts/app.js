
// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: '/Scripts/',
    urlArgs: "bust=v3",
    paths: {
        text: "text",
        knockout: 'knockout-3.5.1',
        knockout_validation: 'libraries/knockout.validation.min',
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
//requirejs(['app/main']);