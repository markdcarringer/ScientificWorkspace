module.exports =
{
    domainDefined : function( domain )
    {
        if ( domain in gTagDefs )
            return true;

        return false;
    },

    domainDefine : function( domain )
    {
        if ( !(domain in gTagDefs ))
        {
            gTagDefs[domain] = {};
        }
    },

    domainUndefine : function( domain )
    {
        if ( domain in gTagDefs )
        {
            delete gTagDefs[domain];
        }
    },

    domainGet : function()
    {
        var domains = [];

        for ( var domain in gTagDefs )
        {
            if ( gTagDefs.hasOwnProperty( domain ))
            {
                domains.push( domain );
            }
        }

        var wrapper = { domains: domains };
        return JSON.stringify( wrapper, null, 2 );
    },

    tagDefine : function( domain, payload )
    {
        if ( payload && payload.tags )
        {
            if ( !(domain in gTagDefs ))
                gTagDefs[domain] = {};

            for ( var i = 0; i < payload.tags.length; i++ )
            {
                gTagDefs[domain][payload.tags[i].id] = new TagRecord(payload.tags[i].desc);
            }
        }
        else throw ERR_INVALID_REQUEST;
    },

    tagUndefine : function( domain, tag )
    {
        if ( domain in gTagDefs )
        {
            if ( tag in gTagDefs[domain] )
                delete gTagDefs[domain][tag];
        }
    },

    tagGet : function ( a_domain, a_tag )
    {
        var tags = [];

        if ( a_domain in gTagDefs )
        {
            if ( a_tag )
            {
                if ( a_tag in gTagDefs[a_domain] )
                    tags.push( new TagInfo( a_tag, a_domain, gTagDefs[a_domain][a_tag].desc ));
                else
                    throw ERR_INVALID_OBJECT;

            }
            else
            {
                for ( var tag in gTagDefs[a_domain] )
                {
                    if ( gTagDefs[a_domain].hasOwnProperty( tag ))
                        tags.push( tag );
                }
            }
        }
        else
            throw ERR_INVALID_OBJECT;


        var wrapper = { tags: tags };
        return JSON.stringify( wrapper, null, 2 );
    },

    jobGet : function ( a_job )
    {
        if ( a_job in gJobData )
        {
            return JSON.stringify( gJobData[a_job], null, 2 );
        }
        else throw ERR_INVALID_OBJECT;
    },

    jobQuery : function ( query )
    {
        var from;
        var to;

        if ( query.from !== undefined )
            from = new Date(query.from);
        if ( query.to !== undefined )
            to = new Date(query.to);


        var jobs = [];

        var job_list = [];

        if ( query.tags )
        {
            // Tags is a comma-sep list of domain:tag
            var tag_list = query.tags.split(",");
            for ( var t in tag_list )
            {
                var parts = tag_list[t].split(":");
                if ( parts[0] && parts[1] )
                {
                    //console.log( parts[0] + ":" + parts[1] );
                    if ( parts[0] in gTagDefs )
                    {
                        if ( parts[1] in gTagDefs[parts[0]] )
                        {
                            var objects = gTagDefs[parts[0]][parts[1]].objects;
                            for ( var obj in objects )
                            {
                                if ( !(objects[obj] in job_list ))
                                {
                                    job_list.push( objects[obj] );
                                }
                            }
                        }
                    }
                }
                else if ( parts[0] )
                {
                    //console.log( parts[0] );
                    // What to do here?
                }
            }
        }
        else
        {
            job_list = gJobData;
        }

        for ( var i = 0; i < job_list.length; i++ )
        {
            if ( query.user !== undefined && job_list[i].user != query.user )
                continue;
            if ( query.job !== undefined && job_list[i].job != query.job )
                continue;
            if ( query.project !== undefined && job_list[i].project != query.project )
                continue;
            if ( from !== undefined && job_list[i].start_date < from )
                continue;
            if ( to !== undefined && job_list[i].start_date > to )
                continue;

            // Made it here, so this entry is a result
            jobs.push( job_list[i].job );
        }

        var wrapper = { jobs: jobs };
        var result = JSON.stringify( wrapper, null, 2 );

        return result;
    },

    jobAddTag : function( a_job, a_domain, a_tag )
    {
        if ( a_domain in gTagDefs )
        {
            if ( a_tag in gTagDefs[a_domain] )
            {
                if ( a_job in gJobData )
                {
                    gTagDefs[a_domain][a_tag].objects.push( gJobData[a_job] );
                }
                else throw ERR_INVALID_OBJECT;
            }
            else throw ERR_INVALID_OBJECT;
        }
        else throw ERR_INVALID_OBJECT;
    },

    jobRemoveTag : function( a_job, a_domain, a_tag )
    {
        if ( a_domain in gTagDefs )
        {
            if ( a_tag in gTagDefs[a_domain] )
            {
                if ( a_job in gJobData )
                {
                    var objects = gTagDefs[a_domain][a_tag].objects;
                    var index = objects.indexOf( a_job );
                    if ( index > -1 )
                        objects.splice( index, 1 );
                }
                else throw ERR_INVALID_OBJECT;
            }
            else throw ERR_INVALID_OBJECT;
        }
        else throw ERR_INVALID_OBJECT;
    }

};


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

// Tags are organized by domain-tag-description
var gTagDefs = {};
// Jobs are keyed by numeric job id
var gJobData = [];

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


function TagInfo(id,domain,desc)
{
    this.id     = id;
    this.domain = domain;
    this.desc   = desc;
}

function TagRecord(desc)
{
    this.desc       = desc;
    // What else? Created, CreatedBy, DOI stuff...
    this.objects    = [];
}


