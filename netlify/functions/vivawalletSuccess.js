exports.handler = async function(event, context, callback) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method not allowed" }),
        }
    }

    const api_urls = {
        demo: 'https://demo-api.vivapayments.com/checkout/v2/transactions',
        live: 'https://api.vivapayments.com/checkout/v2/transactions'
    }
    
    // Get query string data
    const query = event.queryStringParameters

    // Call the VivaWallet API to create a payment order
    const vivawallet_response = await fetch(`${api_urls[process.env.VIVAWALLET_MODE]}/${query.t}`, {
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": `Bearer ${process.env.VIVAWALLET_TOKEN}`
        }
    })

    const data = await vivawallet_response.json()
    if (!vivawallet_response.ok) {
        return {
            statusCode: 400,
            body: '',
        }
    }

    const response = await fetch('https://payment.snipcart.com/api/private/custom-payment-gateway/payment', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SNIPCART_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentSessionId: data.merchantTrns,
            state: 'processed',
            transactionId: query.t,
        }),
    });

    const body = await response.json();
    if (!response.ok) {
        return {
            statusCode: 400,
            body: JSON.stringify(body),
        };
    }

    // Redirect customer to the success page
    return {
        statusCode: 302,
        headers: {
            "Location": body.returnUrl
        }
    };
}