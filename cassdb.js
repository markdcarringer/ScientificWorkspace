var helenus = require('./node_modules/helenus');
var Err = require('./errors');

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
                Err.sendError( reply, err );
            else
            {
                var record = {};

                record["type"] = "user";
                results.forEach( function( row )
                {
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
                            record[name] = value;
                    });
                });

                sendReply( reply, record );
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
                Err.sendError( reply, err );
            else
            {
                var users = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "user";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
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
            throw Err.MISSING_REQUIRED_PARAM;

        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from groups" + where_clause, [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var groups = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "group";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
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
                Err.sendError( reply, err );
            else
            {
                var users = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "group";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
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
                Err.sendError( reply, err );
            else
            {
                var jobs = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "job";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
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
                Err.sendError( reply, err );
            else
            {
                var jobs = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "job";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
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
           throw Err.MISSING_REQUIRED_PARAM;

        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from apps" + where_clause, [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var apps = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "app";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
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
           throw Err.MISSING_REQUIRED_PARAM;

        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from apps where appid = " + a_appid + " and jobid = " + query.jobid + " allow filtering", [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var apps = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "app";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
                            record[name] = value;
                    });

                    apps.push( record );
                });

                sendReply( reply, { apps: apps } );
            }
        });
    },

    //===== TAG API ===========================================================

    tagGet : function ( reply, a_tagname, query )
    {
        // Enforce required query parameter(s)
        if ( query.uid === undefined )
           throw Err.MISSING_REQUIRED_PARAM;

        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from tags where tagname = '" + a_tagname + "' and uid = " + query.uid + " allow filtering", [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                if ( !results.length )
                    Err.sendError( reply, Err.INVALID_OBJECT );
                else
                {
                    var record = {};
                    record["type"] = "tag";
                    results.forEach( function( row )
                    {
                        row.forEach( function( name, value, ts, ttl )
                        {
                            if ( name === "uuid" )
                                record[name] = value.toString();
                            else
                                record[name] = value;
                        });
                    });
                    sendReply( reply, record );
                }
            }
        });
    },

    tagQuery : function ( reply, query )
    {
        // Enforce required query parameter(s)
        if ( query.uid === undefined )
           throw Err.MISSING_REQUIRED_PARAM;

        var where_clause = parseWhereClause( query );
        var columns = parseColumns( query );

        pool.cql( "select " + columns + " from tags" + where_clause, [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var tags = [];

                results.forEach( function( row )
                {
                    var record = {};
                    record["type"] = "tag";
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "uuid" )
                            record[name] = value.toString();
                        else
                            record[name] = value;
                    });

                    tags.push( record );
                });

                sendReply( reply, { tags: tags } );
            }
        });
    },

    // Creates a new tag with specified name and properties (in query)
    // If tag is created, call responds with newly created tag info in payload
    // If tag already exists, call fails with
    tagPut : function ( reply, a_tagname, query )
    {
        // Enforce required query parameter(s)
        if ( query.uid === undefined || query.visibility === undefined )
           throw Err.MISSING_REQUIRED_PARAM;

        pool.cql( "insert into tags (tagid,tagdesc,tagname,uid,visibility,wtime) values (now(),'" + ((query.desc === undefined) ? "" : query.desc) + "','" + a_tagname + "'," + query.uid + ",'" + query.visibility + "',dateof(now()))", [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var subquery = {};
                subquery.uid = query.uid;
                tagGet( reply, a_tagname, subquery );
                //sendReply( reply, "" );
            }
        });
    },

    // Deletes based on Tag UUID
    // If tag exists it will be deleted, no payload in server reponse
    // If tag does not exist, call will succeed but no action will be taken (no payload)
    // If tag is malformed, call will fail with exception info in payload
    tagDelete : function ( reply, a_taguuid, query )
    {
        // Enforce required query parameter(s)
        // None currently

        pool.cql( "delete from tags where tagid = " + a_taguuid, [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
                sendReply( reply, {} );
        });
    },

    //===== ASSOCIATIONS API ==================================================

    associationsGet : function ( reply, a_uuid, query )
    {
        // Enforce required query parameter(s)
        // None for now

        pool.cql( "select nodeuuid, nodetype from associations where edgeuuid = " + a_uuid + " allow filtering", [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var wrapper = {};

                // For now, only TAGS can be first end-point of an association
                wrapper["uuid"] = a_uuid;
                wrapper["type"] = "tag";

                var associations = [];

                results.forEach( function( row )
                {
                    var record = {};
                    row.forEach( function( name, value, ts, ttl )
                    {
                        if ( name === "nodeuuid" )
                            record["uuid"] = value.toString();
                        else
                            record["type"] = value;
                    });

                    associations.push( record );
                });

                wrapper["associations"] = associations;
                sendReply( reply, wrapper );
            }
        });
    },

    associationsPut : function ( reply, a_uuid, query )
    {
        // Enforce required query parameter(s)
        if ( query.uuid === undefined || query.type === undefined )
           throw Err.MISSING_REQUIRED_PARAM;

        //pool.cql( "insert into associations (edgeuuid,nodeuuid,nodetype) values (" + a_uuid + "," + query.uuid + ",'" + query.type + "')", [], function( err, results )
        pool.cql( "insert into associations (edgeuuid,nodeuuid,nodetype) values (" + a_uuid + "," + query.uuid + "," + query.type + ")", [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
                sendReply( reply, "" );
        });
    },

    associationsDelete : function ( reply, a_uuid, query )
    {
        // Enforce required query parameter(s)
        if ( query.uuid === undefined )
           throw Err.MISSING_REQUIRED_PARAM;

        //pool.cql( "insert into associations (edgeuuid,nodeuuid,nodetype) values (" + a_uuid + "," + query.uuid + ",'" + query.type + "')", [], function( err, results )
        pool.cql( "delete from associations where edgeuuid = " + a_uuid + " and nodeuuid = " + query.uuid, [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
                sendReply( reply, "" );
        });
    },

    //===== DIRECTORY and FILES API ===========================================

    filesGet : function ( reply, query )
    {
        // Enforce required query parameter(s)
        if ( query.path === undefined || ( query.gid === undefined && query.uid === undefined ))
            throw Err.MISSING_REQUIRED_PARAM;

        var max_depth = 1;
        if ( query.depth !== undefined )
            max_depth = query.depth;

        var hidefiles = false;
        if ( query.hidefiles === "true" || query.hidefiles === "1" )
            hidefiles = true;

        var tmp;
        var i;
        var gids = undefined;
        var uid = undefined;

        // Get UID for in-memory filtering of results
        // Must convert the string values to integer values for subsequent comparison to row values
        if ( query.uid !== undefined )
            uid = parseInt( query.uid );

        // Build GID array for in-memory filtering of results
        // Must convert the string values to integer values for subsequent comparison to row values
        if ( query.gid !== undefined )
        {
            gids = [];
            tmp = query.gid.split(',');
            for ( i = 0; i < tmp.length; ++i )
                gids.push( parseInt( tmp[i] ));
        }

        // Built extra fields to return from file system table
        var extras = [];
        if ( query.retrieve !== undefined )
        {
            tmp = query.retrieve.split(',');
            for ( i = 0; i < tmp.length; ++i )
                extras.push( tmp[i] );
        }

        // Find starting point using provided path
        pool.cql( "select * from spiderfs where namespace = '" + query.path + "'", [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                var data = [];
                var metadata = [];

                if ( results.length > 0 )
                    processFileRows( results, data, metadata, uid, gids, hidefiles, 0, extras );

                if ( data.length > 0 )
                    processNextDirectory( reply, query, data, metadata, uid, gids, hidefiles, max_depth, extras );
                else
                    sendReply( reply, {} );
            }
        });
    }
};


function FileMetadata( id, pid, depth )
{
    this.id         = id;
    this.pid        = pid;
    this.depth      = depth;
    this.processed  = 0;
}


function processFileRows( a_results, a_data, a_metadata, a_uid, a_gids, a_hidefiles, a_depth, a_extras )
{
    var ns;
    var p = 0;
    var name = "";
    var gid = 0;
    var uid = 0;
    var isfile = false;
    var access = false;

    a_results.forEach( function( row )
    {
        uid = row.get('uid').value;
        gid = row.get('gid').value;
        isfile = row.get('ntype').value;

        if ( a_uid === 0 || a_gids === 0 ) // Root access
            access = true;
        else if ( a_uid === uid )
            access = true;
        else if ( a_gids !== undefined && a_gids.indexOf( gid ) > -1 )
            access = true;
        else
            access = false;

        // For now, filter gid on server side (cassandra doesn't allow OR in where clause)
        if ( access && ( a_hidefiles === false || isfile === false ))
        {
            ns = row.get('namespace').value;

            // Only need to do this once b/c base path is same for all rows
            if ( p === 0 )
                p = ns.lastIndexOf("|");

            if ( p < 0 )
                name = ns;
            else
                name = ns.substr( p + 1 );

            var data_rec = {};
            data_rec.type       = "file";
            data_rec.uuid       = row.get('uuid').value;
            if ( data_rec.uuid !== null )
                data_rec.uuid  = data_rec.uuid .toString();
            data_rec.name       = name;
            data_rec.uid        = uid;
            data_rec.gid        = gid;
            data_rec.filecount  = row.get('filecount').value;
            data_rec.isfile     = isfile;

            a_extras.forEach( function( field )
            {
                data_rec[field] = row.get(field).value;
            });

            a_data.push( data_rec );
            a_metadata.push( new FileMetadata( row.get('id').value, row.get('pid').value, a_depth ));
        }
    });
}


function processNextDirectory( reply, query, data, metadata, uid, gids, hidefiles, max_depth, extras )
{
    var index = -1;

    // Find next entry that needs to be followed
    for ( var i = 0; i < metadata.length; ++i )
    {
        if ( metadata[i].processed === 0 )
        {
            if ( metadata[i].depth < max_depth && data[i].isfile === false )
            {
                index = i;
                break;
            }
            else
                metadata[i].processed = 1;
        }
    }

    if ( index < 0 )
    {
        // All rows have been processed, send results
        buildFileObject( data[0], 0, data, metadata );
        sendReply( reply, data[0] );
    }
    else
    {
        var cur_row = metadata[index];
        cur_row.processed = 1;

        // Query db for next directory
        pool.cql( "select * from spiderfs where pid = " + cur_row.id, [], function( err, results )
        {
            if ( err )
                Err.sendError( reply, err );
            else
            {
                processFileRows( results, data, metadata, uid, gids, hidefiles, cur_row.depth + 1, extras );

                // Find next row to process
                processNextDirectory( reply, query, data, metadata, uid, gids, hidefiles, max_depth, extras );
            }
        });
    }
}


function buildFileObject( object, obj_idx, data, metadata )
{
    var md = metadata[obj_idx];

    for ( var i = 0; i < metadata.length; ++i )
    {
        if ( metadata[i].pid === md.id )
        {
            if ( object.files === undefined )
                object.files = [];

            buildFileObject( data[i], i, data, metadata );
            object.files.push( data[i] );
        }
    }
}



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

