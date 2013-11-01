var helenus = require('./node_modules/helenus');

var pool = new helenus.ConnectionPool(
    {
        hosts       : ['dexter.ornl.gov:9160'],
        keyspace    : 'SciDataPtl',
        user        : 'nodeuser',
        password    : 'nodeuser',
        timeout     : 3000
    });

pool.on( 'error',
    function(err)
    {
        console.error( err.name, err.message );
    });

pool.connect( function( err, keyspace )
    {
        console.error( err, keyspace );
    });

module.exports =
{
    //===== USERS API =========================================================

    userGet : function ( reply, a_username, query )
    {
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from users where username = ?", [a_username], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var user = {};

                results.forEach( function( row )
                {
                    row.forEach( function( name, value, ts, ttl )
                    {
                        user[name] = value;
                    });
                });

                sendReply( reply, user );
            }
        });
    },

    userQuery : function ( reply, query )
    {
        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from users" + where_clause, [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var users = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    users.push( record );
                });

                sendReply( reply, { users: users } );
            }
        });
    },

    //===== GROUPS API ==========================================================

    groupQuery : function ( reply, query )
    {
        // Enforce required query parameter(s)
        if ( query.uid === undefined )
            throw ERR_MISSING_REQUIRE_PARAM;

        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from groups" + where_clause, [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var groups = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    groups.push( record );
                });

                sendReply( reply, { groups: groups } );
            }
        });
    },

    groupGet : function ( reply, a_gid, query )
    {
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from groups where gid = " + a_gid + " allow filtering", [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var users = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    users.push( record );
                });

                sendReply( reply, { users: users } );
            }
        });
    },

    //===== JOBS API ==========================================================

    jobGet : function ( reply, a_jobid, query )
    {
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from jobs where jobid = " + a_jobid, [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var jobs = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    jobs.push( record );
                });

                sendReply( reply, { jobs: jobs } );
            }
        });
    },

    jobQuery : function ( reply, query )
    {
        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from jobs" + where_clause, [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var jobs = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    jobs.push( record );
                });

                sendReply( reply, { jobs: jobs } );
            }
        });
    },

    //===== APPS API ==========================================================

    appQuery : function ( reply, query )
    {
        // Enforce required query parameter(s)
        if ( query.jobid === undefined )
           throw ERR_MISSING_REQUIRE_PARAM;

        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from apps" + where_clause, [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var apps = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    apps.push( record );
                });

                sendReply( reply, { apps: apps } );
            }
        });
    },

    appGet : function ( reply, a_appid, query )
    {
        // Enforce required query parameter(s)
        if ( query.jobid === undefined )
           throw ERR_MISSING_REQUIRE_PARAM;

        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from apps where appid = " + a_appid + " and jobid = " + query.jobid + " allow filtering", [], function( err, results )
        {
            if ( err )
            {
                sendError( reply, err );
            }
            else
            {
                var apps = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        record[name] = value;
                    });

                    apps.push( record );
                });

                sendReply( reply, { apps: apps } );
            }
        });
    },

    //===== DIRECTORY and FILES API ===========================================

    directoriesGet : function ( reply, query )
    {
        sendError( reply, "API Not Implemented" );
    },

    filesGet : function ( reply, query )
    {
        sendError( reply, "API Not Implemented" );
    }
};


function parseColumns( query )
{
    if ( query.retrieve !== undefined )
        return query.retrieve;
    else
        return "*";
}


function isStartRange( prop )
{
    switch ( prop )
    {
    case "starttime":
    case "start_job":
    case "from_create":
    case "from_update":
        return 1;
    default:
        return 0;
    }
}

function isEndRange( prop )
{
    switch ( prop )
    {
    case "endtime":
    case "end_job":
    case "to_create":
    case "to_update":
        return 1;
    default:
        return 0;
    }
}


function shouldIgnore( prop )
{
    switch ( prop )
    {
    case "retrieve":
    case "path":
    case "offset":
    case "count":
        return 1;
    default:
        return 0;
    }
}


function shouldQuote( prop )
{
    switch ( prop )
    {
    case "uid":
    case "gid":
    case "jobid":
    case "joberr":
    case "processors":
    case "walltime":
        return 0;
    default:
        return 1;
    }
}

function parseWhereClause( query )
{
    var clause = "";
    var tmp = "";

    for ( var prop in query )
    {
        if ( query.hasOwnProperty( prop ))
        {
            if ( shouldIgnore( prop ))
                continue;

            if ( clause.length )
                clause += " and ";

            if ( shouldQuote( prop ))
                tmp = "'" + query[prop] + "'";
            else
                tmp = query[prop];

            if ( isStartRange( prop ))
                clause += prop + " >= " + tmp;
            else if ( isEndRange( prop ))
                clause += prop + " <= " + tmp;
            else
                clause += prop + " = " + tmp;
        }
    }

    if ( clause.length )
        return " where " + clause + " allow filtering";
    else
        return "";
}


function sendReply( reply, wrapper )
{
    reply.writeHead(200);
    reply.write( JSON.stringify( wrapper, null, 2 ));
    reply.end();
}


function sendError( reply, error )
{
    reply.writeHead(400);
    reply.write( "<html><body>Error: " + error + "</body></html>" );
    reply.end();
}

// Exception values
var ERR_INVALID_REQUEST = -1;
var ERR_INVALID_OBJECT  = -2;
var ERR_INVALID_PROPERTY = -3;
var ERR_MISSING_REQUIRE_PARAM = -4;
