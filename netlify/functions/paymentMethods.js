exports.handler = async function(event, context, callback) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method not allowed" }),
        }
    }

    // Get request's body
    const request = JSON.parse(event.body)

    // Validate that the request is coming from Snipcart
    const response = await fetch(`https://payment.snipcart.com/api/public/custom-payment-gateway/validate?publicToken=${request.PublicToken}`)

    // Return a 404 if the request is not from Snipcart
    if (!response.ok) return {
        statusCode: 400,
        body: ""
    }

    // Create a payment method list
    let paymentMethodList = []
    if (process.env.VIVAWALLET_ENABLE) {
        paymentMethodList.push({
            id: 'vivawallet',
            name: 'VivaWallet',
            iconUrl: 'https://developer.vivawallet.com/images/new-payment-methods-logos/vivawallet.svg?width=50px',
            checkoutUrl: process.env.URL + '/.netlify/functions/vivawalletRedirect',
        })
    }

    // Return successful status code and available payment methods
    return {
        statusCode: 200,
        body: JSON.stringify(paymentMethodList),
    };
}
