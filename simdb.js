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
        else
            throw ERR_INVALID_OBJECT;
    },

    domainUndefine : function( domain )
    {
        if ( domain in gTagDefs )
        {
            delete gTagDefs[domain];
        }
        else
            throw ERR_INVALID_OBJECT;
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

            //for ( var tag in payload.tags )
            for ( var i = 0; i < payload.tags.length; i++ )
            {
                gTagDefs[domain][payload.tags[i].id] = new TagRecord(payload.tags[i].desc);
            }
        }
        else throw ERR_INVALID_REQUEST;
    },

    tagUndefine : function( domain, payload )
    {
        if ( payload && payload.tags )
        {
            if ( domain in gTagDefs )
            {
                for ( var tag in payload.tags )
                {
                    if ( tag.id in gTagDefs[domain] )
                    {
                        delete gTagDefs[domain][tag.id];
                    }
                }
            }
            else throw ERR_INVALID_OBJECT;
        }
        else throw ERR_INVALID_REQUEST;
    },

    tagGet : function ( a_domain, a_tag )
    {
        var tags = [];
        var taginfo = new TagInfo();

        if ( a_domain in gTagDefs )
        {
            if ( a_tag )
            {
                if ( a_tag in gTagDefs[a_domain] )
                {
                    taginfo.id = a_tag;
                    taginfo.domain = a_domain;
                    taginfo.desc = gTagDefs[a_domain][a_tag].desc;
                    tags.push( taginfo );
                }
                else
                    throw ERR_INVALID_OBJECT;

            }
            else
            {
                for ( var tag in gTagDefs[a_domain] )
                {
                    if ( gTagDefs[a_domain].hasOwnProperty( tag ))
                    {
                        taginfo.id = tag;
                        taginfo.domain = a_domain;
                        taginfo.desc = gTagDefs[a_domain][tag].desc;
                        tags.push( taginfo );
                    }
                }
            }
        }
        else
            throw ERR_INVALID_OBJECT;


        var wrapper = { tags: tags };
        return JSON.stringify( wrapper, null, 2 );
    }
};

// Exception values
var ERR_INVALID_REQUEST = -1;
var ERR_INVALID_OBJECT  = -2;
var ERR_INVALID_PROPERTY = -3;

// Tags are organized by domain-tag-description
var gTagDefs = {};


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


