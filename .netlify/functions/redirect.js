exports.handler = async function(event, context, callback) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 501,
            body: JSON.stringify({ message: "Not Implemented" }),
        }
    }
    
    // Get public token from query string
    const publicToken = new URLSearchParams(window.location.search).get('publicToken')

    // Fetch payment session from API
    const response = await fetch(`https://payment.snipcart.com/api/public/custom-payment-gateway/payment-session?publicToken=${publicToken}`);

    // Retrieve body as JSON if the request's status code is successful
    if (response.ok) {
        const paymentSession = await response.json()
    }
    
    let viva_payload = {
        amount: 100 * paymentSession.invoice.amount,
        customerTrns: '',
        customer: {
            email: paymentSession.invoice.email,
            fullName: paymentSession.billingAddress.name,
            countryCode: paymentSession.billingAddress.country,
        },
        maxInstallments: 0,
        disableCash: true,
        sourceCode: paymentSession.id,
        merchantTrns: paymentSession.id,
    }
    
    const response = await fetch('https://demo-api.vivapayments.com/checkout/v2/orders')
    
    /*
    url: 'https://demo-api.vivapayments.com/checkout/v2/orders' / POST
    headers: {
          "Location": "https://www.interactive-design.gr",
        },
        */

    // Return successful status code and available payment methods
    return {
        statusCode: 404,
        body: "",
    };
}
