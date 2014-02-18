var gHttp = require('http');
var gUrl = require('url');

// Exception values
const INVALID_REQUEST = -1;
const INVALID_OBJECT  = -2;
const MISSING_REQUIRED_PARAM = -3;
const NOT_AUTHORIZED = -4;
const INVALID_METHOD = -5;

module.exports =
{
    INVALID_REQUEST: INVALID_REQUEST,
    INVALID_OBJECT: INVALID_OBJECT,
    MISSING_REQUIRED_PARAM: MISSING_REQUIRED_PARAM,
    NOT_AUTHORIZED: NOT_AUTHORIZED,
    INVALID_METHOD: INVALID_METHOD,

    // Generate error and exception messages for a service request
    sendError: function ( result, e )
    {
        switch ( e )
        {
        case NOT_AUTHORIZED:
            result.writeHead(401);
            break;
        case INVALID_REQUEST:
            result.writeHead(400);
            break;
        case INVALID_METHOD:
            result.writeHead(405);
            break;
        case INVALID_OBJECT:
            result.writeHead(404);
            break;
        case MISSING_REQUIRED_PARAM:
            result.writeHead(403);
            result.write("<body></html>Missing one or more required query parameters</body></html>");
            break;
        default:
            // Most likely heleneus CQL call failed due to bad query parameters
            result.writeHead(400);
            result.write("<body></html>" + e.toString() + "</body></html>");
            break;
        }

        result.end();
    }
}
