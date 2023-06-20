exports.handler = async function(event, context, callback) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: "Not Implemented" }),
        }
    }

    // Return successful status code and available payment methods
    return {
        statusCode: 302,
        headers: {
          "Location": "https://www.interactive-design.gr",
        },
    };
}
