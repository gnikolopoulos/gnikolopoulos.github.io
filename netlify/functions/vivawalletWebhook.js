exports.handler = async function(event, context, callback) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method not allowed" }),
        }
    }

    // Retrieve payment information from the event object
    const request = JSON.parse(event.body);
    let payment_state = 'processing';
    switch (request.EventTypeId) {
        case 1796:
            payment_state = 'processed'
            break;
        case 1798:
            payment_state = 'failed';
            break;
    }

    const response = await fetch('https://payment.snipcart.com/api/private/custom-payment-gateway/payment', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SNIPCART_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentSessionId: request.EventData.MerchantTrns,
            state: payment_state,
            transactionId: request.EventData.TransactionId,
        }),
    });

    const body = await response.json();
    if (!response.ok) {
        return {
            statusCode: 400,
            body: JSON.stringify(body),
        };
    }

    // Return successful status
    return {
        statusCode: 200,
        body: JSON.stringify(body)
    };
}