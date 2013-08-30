
var jsonp = 'true';

// Exception values
var ERR_INVALID_REQUEST = -1;
var ERR_INVALID_OBJECT  = -2;
var ERR_INVALID_PROPERTY = -3;

var gHttp = require('http');
var gUrl = require('url');
var gDB = require('./simdb');


function encapsulateCallback(data) {
	if(jsonp) {
		var callback = '_testcb(' + data + ')';
		console.log('callback: ' + callback);
	    return callback;
	} else {
		return data;
	}
	
}

//=============================================================================
// Project Service Functions

function handleProjectRequest( method, path, query, payload, res )
{
    res.writeHead(200);
    res.write('Project API not implemented.');
    res.end();
}



// Handle job service requests
function handleJobRequest( method, path, query, payload, res )
{
    // API:
    // GET host/jobs - all josb with query params
    // GET host/jobs/job - job record
    // PUT host/jobs/job/domain/tag
    // DELETE host/jobs/job/domain/tag

    var result = "";

    if ( path[2] )
    {
        // Do something with a particular job

        if ( method === "GET" )
        {
            // GET host/jobs/job_id
            // Return full job record
            result = gDB.jobGet( path[2] );
        }
        else if ( method === "PUT" && path[3] && path[4] )
        {

            gDB.jobAddTag( path[2], path[3], path[4] ); // Throws if something goes wrong
        }
        else if ( method === "DELETE" && path[3] && path[4] )
        {
            // DELETE only work for tags property, path[3] = domain, path[4] = tag to delete

            gDB.jobRemoveTag( path[2], path[3], path[4] ); // Throws if something goes wrong
        }

        else throw ERR_INVALID_REQUEST;
    }
    else
    {
        if ( method !== "GET" )
            throw ERR_INVALID_REQUEST;

        result = gDB.jobQuery( query );
    }

    console.log('RESULT: ' + result);
    
    var callback = encapsulateCallback(result);
    
    res.writeHead(200);
    //res.write( result );
    res.write(callback);
    res.end();
}

//=============================================================================
// FILE Service Functions

/* Provides directory and file listing API */

function handleFileRequest( method, path, query, payload, res )
{
    // API:
    // GET host/files

    res.writeHead(200);
    res.write('File API not implemented.');
    res.end();
}

//=============================================================================
// USER Service Functions

/* Provides access control API */

function handleUserRequest( method, path, query, payload, res )
{
    res.writeHead(200);
    res.write('User API not implemented.');
    res.end();
}

//=============================================================================
// DOMAIN Service Functions

/* The DOMAIN API supports the creation, listing, and deletion of domains.
Domains are simply containers for tags. */

function handleDomainRequest( method, path, query, payload, res )
{
    // API:
    // GET host/domains - all domains
    // PUT host/domains/domain - defines domain from payload
    // DELETE host/domains/domain - remove domain

    var result = "";

    if ( method === "GET" )
    {
        if ( path.length === 2 )
        {
            result = gDB.domainGet();
        }
        else
            throw ERR_INVALID_REQUEST;
    }
    else if ( method === "PUT" )
    {
        if ( path.length !== 3 )
            throw ERR_INVALID_REQUEST;

        gDB.domainDefine( path[2] );
    }
    else if ( method === "DELETE" )
    {
        if ( path.length !== 3 )
            throw ERR_INVALID_REQUEST;

        gDB.domainUndefine( path[2] );
    }

    res.writeHead(200);
    res.write( result );
    res.end();
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


//=============================================================================
//=============================================================================
// Serice Entry Point

// Dispatch request to handler based on verb and URL path
function dispatchRequest( method, path, query, payload, res )
{
console.log( method ); console.log( path.length ); console.log( path );

    if ( path[1] )
    {
        switch ( path[1] )
        {
        case "projects":
            handleProjectRequest( method, path, query, payload, res );
            break;
        case "jobs":
            handleJobRequest( method, path, query, payload, res );
            break;
        case "files":
            handleFileRequest( method, path, query, payload, res );
            break;
        case "users":
            handleUserRequest( method, path, query, payload, res );
            break;
        case "domains":
            handleDomainRequest( method, path, query, payload, res );
            break;
        case "tags":
            handleTagRequest( method, path, query, payload, res );
            break;
        default:
            throw ERR_INVALID_REQUEST;
        }
    }
    else
    {
        if ( method === "GET" )
        {
            res.writeHead(200);
            res.write('{"resources":["projects","jobs","files","users","domains","tags"]}');
            res.end();
        }
        else throw ERR_INVALID_REQUEST;
    }
}

// Generate error and exception messages for a service request
function sendError(res,e)
{
    res.writeHead(400);
    res.write("<html><body>Error: ");

    switch ( e )
    {
    case ERR_INVALID_REQUEST:
        res.write("Invalid request");
        break;
    case ERR_INVALID_OBJECT:
        res.write("Invalid object");
        break;
    case ERR_INVALID_PROPERTY:
        res.write("Invalid object property");
        break;
    default:
        res.write( e.toString() );
        break;
    }

    res.write("</body></html>");
    res.end();
}


// Entry-point for service requests
var server = gHttp.createServer(function(req, res)
{
    var url     = gUrl.parse( req.url, true );
    var query   = url.query;
    var path    = url.pathname.split("/");
    var payload;

    try
    {
        if ( req.method === 'POST' || req.method === 'PUT' )
        {
            var body = '';

            req.on('data', function (chunk)
            {
                body += chunk;
            });

            req.on('end', function ()
            {
                try
                {
                    var payload;

                    if ( body.length )
                        payload = JSON.parse( body );

                    dispatchRequest( req.method, path, query, payload, res );
                }
                catch ( e )
                {
                    sendError(res,e);
                }
            });
        }
        else
        {
            dispatchRequest( req.method, path, query, payload, res );
        }
    }
    catch ( e )
    {
        sendError(res,e);
    }
});

server.listen(8080);
