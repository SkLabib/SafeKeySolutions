// Global function to open the modal and populate the product details
window.openPaymentForm = function(productName, price) {
    document.getElementById('productName').value = productName;
    document.getElementById('price').value = price;

    const modal = document.getElementById('my_modal_2');
    if (modal) modal.showModal();
}

// Global function to close the modal
window.closeModal = function() {
    const modal = document.getElementById('my_modal_2');
    if (modal) modal.close();
}

// Global function to handle form submission
window.handleSubmit = async function(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    // Check if all fields are filled and validate email
    if (!name || !email || !phone || !address) {
        alert('Please fill all fields!');
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address!');
        return;
    }

    // Get form data
    const paymentData = {
        productName: document.getElementById('productName').value,
        price: parseInt(document.getElementById('price').value) * 100, // Convert to cents
        name,
        email,
        phone,
        address,
    };

    try {
        // Send the payment data to the server to create a checkout session
        const response = await fetch('http://localhost:5001/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success && data.sessionId) {
            const stripe = Stripe('pk_test_51QIki9J1obOaqqTw0r8tQCd5sixaUiPfyOBNgfbew9b2Oh0jzTLp1nvDT7RYnT68ESU5zcTX5R8rTjtaq02cWtIE00dmdPUQW3'); 

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
            if (result.error) {
                alert('Error with payment: ' + result.error.message);
            } else {
                
            }

            window.closeModal(); // Close the modal on success
        } else {
            alert('Payment failed: ' + data.error);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert('An error occurred: ' + error.message);
    }
}
