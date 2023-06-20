exports.handler = async function(event, context, callback) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method not allowed" }),
        }
    }

    const api_urls = {
        demo: 'https://demo.vivapayments.com/web/checkout',
        live: 'https://www.vivapayments.com/web/checkout'
    }
    
    // Get public token from query string
    const publicToken = event.queryStringParameters.publicToken

    // Fetch payment session from API
    const response = await fetch(`https://payment.snipcart.com/api/public/custom-payment-gateway/payment-session?publicToken=${publicToken}`);

    // Retrieve body as JSON if the request's status code is successful
    if (!response.ok) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Session could not be verified" }),
        }
    }
    
    const paymentSession = await response.json()
    let payload = {
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
    
    // Call the VivaWallet API to create a payment order
    const vivawallet_response = await fetch(`${api_urls[process.env.VIVAWALLET_MODE]}/v2/orders`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": `Bearer ${process.env.VIVAWALLET_TOKEN}`
        }
    })

    const data = await vivawallet_response.json()
    if (!vivawallet_response.ok) {
        return {
            statusCode: 400,
            body: JSON.stringify(data),
        }
    }

    // Redirect the user to the payment screen
    return {
        statusCode: 302,
        headers: {
            "Location": `${api_urls[process.env.VIVAWALLET_MODE]}?ref=${data.orderCode}`
        }
    }
}
