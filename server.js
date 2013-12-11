

// Exception values
//TODO These need to be defined externally so they can be shared by db module
var ERR_INVALID_REQUEST = -1;
var ERR_INVALID_OBJECT  = -2;
var ERR_INVALID_PROPERTY = -3;
var ERR_MISSING_REQUIRE_PARAM = -4;

var gHttp = require('http');
var gUrl = require('url');
//var gDB = require('./simdb');
//var gDB = require('./mysqldb');
var gDB = require('./cassdb');


//=============================================================================
// USERS Service Functions

function handleUserRequest( method, path, query, payload, result )
{
    // API:
    // GET host/users - get all users with query params
    // GET host/users/username - get a user record

    if ( method === "GET" )
    {
        if ( path.length === 2 )
        {
        	console.log('result: ' + result + ' query: ' + query);
            gDB.userQuery( result, query );
        }
        else if ( path.length === 3 )
        {
        	console.log('result: ' + result + ' path[2]: ' + path[2] + ' query: ' + query);
            gDB.userGet( result, path[2], query );
        }
        else
            throw ERR_INVALID_REQUEST;
    }
    else
        throw ERR_INVALID_REQUEST;
}


//=============================================================================
// GROUPS Service Functions

function handleGroupRequest( method, path, query, payload, result )
{
    // API:
    // GET host/groups - get all groups for a given uid

    if ( method === "GET" )
    {
        if ( path.length === 2 )
        {
            gDB.groupQuery( result, query );
        }
        else if ( path.length === 3 )
        {
            gDB.groupGet( result, path[2], query );
        }
        else
            throw ERR_INVALID_REQUEST;
    }
    else
        throw ERR_INVALID_REQUEST;
}

//=============================================================================
// JOBS Service Functions

// Handle job service requests
function handleJobRequest( method, path, query, payload, reply )
{
    // API:
    // GET host/jobs - all josb with query params
    // GET host/jobs/jobid - job record

    if ( method === "GET" )
    {
        if ( path.length === 2 )
        {
            gDB.jobQuery( reply, query );
        }
        else if ( path.length === 3 )
        {
            result = gDB.jobGet( reply, path[2], query );
        }
        else throw ERR_INVALID_REQUEST;
    }
    else throw ERR_INVALID_REQUEST;
}


//=============================================================================
// APPS Service Functions

// Handle apps service requests
function handleAppRequest( method, path, query, payload, reply )
{
    // API:
    // GET host/apps - list apps for jobid (in query params)
    // GET host/apps/appid - get app record

    if ( method === "GET" )
    {
        if ( path.length === 2 )
        {
            gDB.appQuery( reply, query );
        }
        else if ( path.length === 3 )
        {
            gDB.appGet( reply, path[2], query );
        }
        else throw ERR_INVALID_REQUEST;
    }
    else throw ERR_INVALID_REQUEST;
}


//=============================================================================
// FILES (and directories) Service Functions

function handleFileRequest( method, path, query, payload, reply )
{
    // API:
    // GET host/files

    if ( method === "GET" )
    {
    	console.log('in server.js get for files');
        if ( path.length === 2 )
        {
        	console.log('reply: ' + reply + ' query: ' + query);
            gDB.filesGet( reply, query );
        }
        else
            throw ERR_INVALID_REQUEST;
    }
    else
        throw ERR_INVALID_REQUEST;
}



//=============================================================================
// TAGS Service Functions


/* The TAG API is to support the administration (CRUD) of tags. This API is NOT
used for tagging data entities - that service is provided on the respective
data entity APIs (for those that support tagging). Tags are generic and can be
applied to any data entity that accepts tags. When a tag is deleted, all
instances of that tag are removed from tagged entities.

Tags live in domains, but domains are accessed and maintined through the Domain
API. If a domain is deleted, all tags associated with that domain are also
deleted.
*/

/*
function handleTagRequest( method, path, query, payload, res )
{
    // API:
    // GET host/tags/domain - all tags within a domain
    // GET host/tags/domain/tag - a specific tag record
    // PUT host/tags/domain - defines a tag from payload
    // DELETE host/tags/domain - remove tags from job

    var result = "";

    if ( method === "GET" )
    {
        // Make sure domain exists

        if ( path.length === 3 )
        {
            result = gDB.tagGet( path[2] );
        }
        else if ( path.length === 4 )
        {
            result = gDB.tagGet( path[2], path[3] );
        }
        else
            throw ERR_INVALID_REQUEST;
    }
    else if ( method === "PUT" )
    {
        if ( path.length !== 3 )
            throw ERR_INVALID_REQUEST;

        gDB.tagDefine( path[2], payload );
    }
    else if ( method === "DELETE" )
    {
        if ( path.length !== 4 )
            throw ERR_INVALID_REQUEST;

        gDB.tagUndefine( path[2], path[3] );
    }
    else throw ERR_INVALID_REQUEST;

    res.writeHead(200);
    res.write( result );
    res.end();
}
*/

//=============================================================================
//=============================================================================
// Serice Entry Point

// Dispatch request to handler based on verb and URL path
function dispatchRequest( method, path, query, payload, reply )
{
//console.log( method ); console.log( path.length ); console.log( path );

    if ( path[1] )
    {
        switch ( path[1] )
        {
        case "users":
            handleUserRequest( method, path, query, payload, reply );
            break;
        case "groups":
            handleGroupRequest( method, path, query, payload, reply );
            break;
        case "jobs":
            handleJobRequest( method, path, query, payload, reply );
            break;
        case "apps":
            handleAppRequest( method, path, query, payload, reply );
            break;
        case "files":
            handleFileRequest( method, path, query, payload, reply );
            break;
        //case "tags":
        //    handleTagRequest( method, path, query, payload, res );
        //    break;
        default:
            throw ERR_INVALID_REQUEST;
        }
    }
    else
    {
        if ( method === "GET" )
        {
            reply.writeHead(200);
            reply.write('{"resources":["users","groups","jobs","apps","directories","files"]}');
            reply.end();
        }
        else throw ERR_INVALID_REQUEST;
    }
}

// Generate error and exception messages for a service request
function sendError(result,e)
{
    result.writeHead(400);
    result.write("<html><body>Error: ");

    switch ( e )
    {
    case ERR_INVALID_REQUEST:
        result.write("Invalid request");
        break;
    case ERR_INVALID_OBJECT:
        result.write("Invalid object");
        break;
    case ERR_INVALID_PROPERTY:
        result.write("Invalid object property");
        break;
    case ERR_MISSING_REQUIRE_PARAM:
        result.write("Missing required query parameter");
        break;
    default:
        result.write( e.toString() );
        break;
    }

    result.write("</body></html>");
    result.end();
}


// Entry-point for service requests
var server = gHttp.createServer( function( request, reply )
{
    var url     = gUrl.parse( request.url, true );
    var query   = url.query;
    var path    = url.pathname.split("/");
    var payload;

    try
    {
        if ( request.method === 'POST' || request.method === 'PUT' )
        {
            var body = '';

            request.on('data', function (chunk)
            {
                body += chunk;
            });

            request.on('end', function ()
            {
                try
                {
                    var payload;

                    if ( body.length )
                        payload = JSON.parse( body );

                    dispatchRequest( request.method, path, query, payload, reply );
                }
                catch ( e )
                {
                    sendError(reply,e);
                }
            });
        }
        else
        {
            dispatchRequest( request.method, path, query, payload, reply );
        }
    }
    catch ( e )
    {
        sendError(reply,e);
    }
});

server.listen(8080);
