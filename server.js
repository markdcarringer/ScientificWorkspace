function JobQuery(user,job,project,tags,from,to)
{
    this.user       = user;
    this.job        = job;
    this.project    = project;
    this.from       = from;
    this.to         = to;
    this.tags       = tags;
}


function JobInfo(user,job,project,start_date,node_count,cmd)
{
    this.user       = user;
    this.job        = job;
    this.project    = project;
    this.start_date = start_date;
    this.node_count = node_count;
    this.cmd        = cmd;
}

// Exception values
var ERR_INVALID_REQUEST = -1;
var ERR_INVALID_OBJECT  = -2;
var ERR_INVALID_PROPERTY = -3;

var gHttp = require('http');
var gUrl = require('url');

var gGroups = {};   // User groups - should eventualy hold more info (roles, fine grain perm)
var gJobData = [];  // This fakes the job database
var gTags = {};     // This fakes the tag database

// Init fake groups
// Each user has a local/private group
gGroups["u1"] = [];
gGroups["u1"].push("u1");
gGroups["u2"] = [];
gGroups["u2"].push("u2");
gGroups["u3"] = [];
gGroups["u3"].push("u3");
// Now some shared groups
gGroups["a"] = [];
gGroups["a"].push("u1","u3");
gGroups["b"] = [];
gGroups["b"].push("u1","u2");
gGroups["c"] = [];
gGroups["c"].push("u2","u3");

// Init fake job data...
gJobData.push( new JobInfo("u1",0,"ABC001",new Date("1-1-2013 1:00:00"),10,"a.out"));
gJobData.push( new JobInfo("u2",1,"ABC001",new Date("3-2-2013 7:00:00"),15,"go"));
gJobData.push( new JobInfo("u1",2,"ABC001",new Date("3-5-2013 3:00:00"),20,"go1"));
gJobData.push( new JobInfo("u2",3,"ABC001",new Date("5-2-2013 4:00:00"),100,"go2"));
gJobData.push( new JobInfo("u3",4,"XYZ001",new Date("5-5-2013 10:00:00"),1,"a.out"));
gJobData.push( new JobInfo("u2",5,"XYZ001",new Date("6-1-2013 4:00:00"),10,"xyz"));
gJobData.push( new JobInfo("u1",6,"XYZ001",new Date("6-10-2013 2:00:00"),1000,"sim -z 123"));
gJobData.push( new JobInfo("u3",7,"XYZ001",new Date("8-1-2013 8:00:00"),200,"go3"));
gJobData.push( new JobInfo("u3",8,"XYZ001",new Date("8-9-2013 10:00:00"),100,"a.out"));

// Init fake tag data
// Tags are arranged by owning group, then tag, then jobs
// Should be able to query by specific tag (u1:bad) or general tag (bad)
gTags["u1"] = {};
gTags["u1"]["good"] = [];
gTags["u1"]["good"].push( gJobData[2] );
gTags["u1"]["good"].push( gJobData[6] );
gTags["u1"]["bad"] = [];
gTags["u1"]["bad"].push( gJobData[0] );

gTags["u2"] = {};
gTags["u2"]["good"] = [];
gTags["u2"]["good"].push( gJobData[1] );
gTags["u2"]["bad"] = [];
gTags["u2"]["bad"].push( gJobData[3] );

gTags["a"] = {};
gTags["a"]["good"] = [];
gTags["a"]["good"].push( gJobData[2] );
gTags["a"]["bad"] = [];
gTags["a"]["bad"].push( gJobData[7] );
gTags["a"]["bad"].push( gJobData[8] );

gTags["b"] = {};
gTags["b"]["good"] = [];
gTags["b"]["good"].push( gJobData[5] );
gTags["b"]["bad"] = [];
gTags["b"]["bad"].push( gJobData[3] );


function isTagged( params, job_info )
{
    var res = false;
    //var tag_grps = [];

    // Loop over all groups
    for ( var grp in gGroups )
    {

        // Is user a member of this group?
        if ( gGroups[grp].indexOf( params.user ) !== -1 )
        {
            // Are there any tags for this group?
            if ( grp in gTags )
            {
                // Do any of the tags match the specified tag?
                if ( params.tags in gTags[grp] )
                {
                    // Is the specified job in the tagged jobs?
                    if ( gTags[grp][params.tags].indexOf( job_info ) !== -1 )
                    {
                        console.log( "Job " + job_info.job + " in " + grp + ":" + params.tags );
                        res = true;
                    }
                }
            }
        }

        if ( res )
            break;
    }

    return res;
}

// USER Management Functions --------------------------------------------------

function isUserDefined(user)
{
    if ( user )
    {
        if ( user in gGroups )
        {
            if ( gGroups[user].indexOf(user) === 0 )
                return true;
        }
    }

    return false;
}

function createUser(root,user)
{
}

function deleteUser(root,user)
{
}

// GROUP Management Functions -------------------------------------------------

// For now, first user (creator) of group is the ONLY admin
function isGroupAdmin(group,admin)
{
    if ( group in gGroups )
    {
        if ( gGroups[group].indexOf( admin ) === 0 )
            return true;
    }

    return false;
}

function isGroupMember(group,user)
{
    if ( group in gGroups )
    {
        if ( gGroups[group].indexOf( user ) !== -1 )
            return true;
    }

    return false;
}

function createGroup(group,admin)
{
    if ( !group || !admin )
        throw "Must specify group and admin.";
    if ( group in gGroups )
        throw "Group already exists.";

    gGroups[group] = [];
    gGroups[group].push(admin);
}

function deleteGroup(group,admin)
{
    if ( !group || !admin )
        throw "Must specify group and admin.";
    if ( !(group in gGroups ))
        throw "Group does not exist.";
    if ( !isGroupAdmin(group,admin))
        throw "User " + admin + " is not an admin for group " + group;

    delete gGroups.group;
}

function addUser(group,admin,user)
{
    if ( !group || !admin || !user )
        throw "Must specify group, admin, and user.";
    if ( !(group in gGroups ))
        throw "Group does not exist.";
    if ( !isGroupAdmin(group,admin))
        throw "User " + admin + " is not an admin for group " + group;
    if ( isGroupMember(group,user))
        throw "User " +user + " is already a member of group " + group;

    gGroups[group].push(user);
}

function removeUser(group,admin,user)
{
    if ( !group || !admin || !user )
        throw "Must specify group, admin, and user.";
    if ( !(group in gGroups ))
        throw "Group does not exist.";
    if ( !isGroupAdmin(group,admin))
        throw "User " + admin + " is not an admin for group " + group;
    if ( !isGroupMember(group,user))
        throw "User " +user + " is not a member of group " + group;

    var idx = gGroups[group].indexOf(user);
    gGroups[group].splice(idx,1);
}


function getGroups(user)
{
    var groups = {};

    if ( user )
    {
        for ( var grp in gGroups )
        {
            if ( gGroups[grp].indexOf( user ) !== -1 )
                groups[grp] = gGroups[grp];
        }
    }
    else
    {
        groups = gGroups;
    }

    return groups;
}


// TAG Management Functions ---------------------------------------------------

function createTag(group,tag)
{
}

function deleteTag(group,tag)
{
}

function getTags(user,group)
{
    var tags = {};

    if ( group )
    {
        if ( group in gGroups && gGroups[group].indexOf( user ) !== -1 )
        {
            for ( var key in gTags[group] )
            {
                if ( gTags[group].hasOwnProperty( key ))
                {
                    if ( tags[group] === undefined )
                        tags[group] = [];
                    tags[group].push( key );
                }
            }
        }
    }
    else
    {
        for ( var grp in gGroups )
        {
            if ( gGroups[grp].indexOf( user ) !== -1 )
            {
                for ( var key in gTags[grp] )
                {
                    if ( gTags[grp].hasOwnProperty( key ))
                    {
                        if ( tags[grp] === undefined )
                            tags[grp] = [];
                        tags[grp].push( key );
                    }
                }
            }
        }
    }

    return tags;
}

// JOB Management API ---------------------------------------------------------

function addJobTag(job,group,tag)
{
}

function deleteJobTag(job,group,tag)
{
}

function getJobs(query)
{
    var from;
    var to;

    if ( query.from != undefined )
        from = new Date(query.from);
    if ( query.to != undefined )
        to = new Date(query.to);

    var jobs = [];

    // Stub/test result
    for ( var i = 0; i < gJobData.length; i++ )
    {
        if ( query.user != undefined && gJobData[i].user != query.user )
            continue;
        if ( query.job != undefined && gJobData[i].job != query.job )
            continue;
        if ( query.project != undefined && gJobData[i].project != query.project )
            continue;
        if ( from != undefined && gJobData[i].start_date < from )
            continue;
        if ( to != undefined && gJobData[i].start_date > to )
            continue;
        if ( query.tags != undefined && !isTagged( query, gJobData[i] ) )
            continue;

        // Made it here, so this entry is a result
        jobs.push( gJobData[i] );
    }

    return jobs;
}


// HTTP Service ---------------------------------------------------------------

// URL Syntax for queries:
// Get jobs for a user:  host.gov/jobs/user
//   Optional Params:
//      project  - jobs belonging to this project
//      job      - get a specific job
//      from_date   - jobs started on and after this date/time
//      to_date     - jobs started on and before this date/time
//      tags        - User defined tag(s)


function handleJobQuery( user, query, res )
{
    var job_qry = new JobQuery( user );

    // Fill-in optional query parameters
    job_qry.job     = query.job;
    job_qry.project = query.project;
    job_qry.tags    = query.tags;
    if ( query.from != undefined )
        job_qry.from = new Date(query.from);
    if ( query.to != undefined )
        job_qry.to = new Date(query.to);

    // Query ALL jobs for user
    var job_info = getJobs( job_qry );

    res.writeHead(200);

    var qry_res =
    {
        user: user,
        jobs: job_info
    };

    res.write(JSON.stringify( qry_res, null, 2 ));
    res.end();
}

// API:
// host/tags
// host/tags/user
// Options: group
function handleTagQuery( user, query, res )
{
    if ( user && !isUserDefined( user ))
        throw "User '" + user + "' is not a valid user.";

    var tags = getTags( user, query.group );

    var qry_res =
    {
        user: user,
        tags: tags
    };

    res.writeHead(200);
    res.write(JSON.stringify( qry_res, null, 2 ));
    res.end();
}

// API:
// host/groups
// host/groups/user
function handleGroupQuery( user, query, res )
{
    if ( user && !isUserDefined( user ))
        throw "User '" + user + "' is not a valid user.";

    var groups = getGroups( user );

    var qry_res =
    {
        user: user,
        groups: groups
    };

    res.writeHead(200);
    res.write(JSON.stringify( qry_res, null, 2 ));
    res.end();
}

// API:
// host/groups
// Payload:
//   cmd : add_group, rem_group, add_user, rem_user
//   group : group_id
//   admin : user_id
//   user : user_id
function handleGroupUpdate( payload, query, res )
{
    if ( payload.cmd === "create_group" )
        createGroup( payload.group, payload.admin );
    else if ( payload.cmd === "delete_group" )
        deleteGroup( payload.group, payload.admin );
    else if ( payload.cmd === "add_user" )
        addUser( payload.group, payload.admin, payload.user );
    else if ( payload.cmd === "remove_user" )
        removeUser( payload.group, payload.admin, payload.user );
    else
        throw "Invalid group command.";

    res.writeHead(200);
    res.end();
}


function handleProjectRequest( method, path, query, payload, res )
{
    res.writeHead(200);
    res.write('Project API not implemented.');
    res.end();
}

// API:
// GET host/jobs - all josb with query params
// GET host/jobs/job - job record
// GET host/jobs/job/prop - job record property

function handleJobRequest( method, path, query, payload, res )
{
    if ( path.length > 4 )
        throw ERR_INVALID_REQUEST;

    if ( path[2] )
    {
        // ??? host/jobs/job_id

        // Get job record, throw if invalid
        if ( !(path[2] in gJobData ))
            throw ERR_INVALID_OBJECT;

        var job = gJobData[path[2]];

        if ( method === "GET" )
        {
            if ( path[3] )
            {
                // GET host/jobs/job_id/property
                if ( job[path[3]] )
                {
                    res.writeHead(200);
                    // Context?
                    //var wrapper = { job: path[2], path[3]: job[path[3]]  };
                    //res.write(JSON.stringify( wrapper, null, 2 ));
                    res.write(JSON.stringify( job[path[3]], null, 2 ));
                    res.end();
                }
                else throw ERR_INVALID_PROPERTY;
            }
            else
            {
                // GET host/jobs/job_id
                res.writeHead(200);
                res.write(JSON.stringify( job, null, 2 ));
                res.end();
            }
        }
        else if ( method === "PUT" && path[3] )
        {
            // PUT host/jobs/job_id/tags
        }
        else if ( method === "DELETE" && path[3] )
        {
            // DELETE host/jobs/job_id/tags
        }

        else throw ERR_INVALID_REQUEST;
    }
    else
    {
        // ??? host/jobs
        if ( method !== "GET" )
            throw ERR_INVALID_REQUEST;

        var jobs = getJobs(query);
        var jids = [];
        for ( var j in jobs )
            jids.push( jobs[j].job );

        res.writeHead(200);

        // Have to wrap arrays in an object to stringify...
        var wrapper = { job_ids: jids };
        res.write(JSON.stringify( wrapper, null, 2 ));
        res.end();
    }
}

function handleFileRequest( method, path, query, payload, res )
{
    res.writeHead(200);
    res.write('File API not implemented.');
    res.end();
}

function handleUserRequest( method, path, query, payload, res )
{
    res.writeHead(200);
    res.write('User API not implemented.');
    res.end();
}

function handleDomainRequest( method, path, query, payload, res )
{
    res.writeHead(200);
    res.write('Domain API not implemented.');
    res.end();
}


function dispatchRequest( method, path, query, payload, res )
{
//console.log( method );
//console.log( path.length );
//console.log( path );

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
        default:
            throw ERR_INVALID_REQUEST;
        }
    }
    else
    {
        if ( method === "GET" )
        {
            res.writeHead(200);
            res.write('{"resources":["projects","jobs","files","users","domains"]}');
            res.end();
        }
        else throw ERR_INVALID_REQUEST;
    }
}


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
                    var payload = JSON.parse( body );

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
