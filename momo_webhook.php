<?php
require_once 'db_connect.php';

// 1. Read the incoming JSON payload sent by the payment gateway
$content = file_get_contents("php://input");
$data = json_decode($content, true);
<link rel="stylesheet" href="style.css">
// Check if the payload contains a successful transaction status
// (Note: The exact array keys depend on your gateway's documentation, e.g., Paypack or MTN)
if ($data && isset($data['status']) && $data['status'] === 'SUCCESSFUL') {
    
    $user_id = intval($data['user_id']); // Passed along in your external reference
    $amount = intval($data['amount']);
    $transaction_type = $data['type']; // 'savings' or 'loan_repayment'

    if ($transaction_type === 'savings') {
        // Automatically credit savings
        $stmt = $conn->prepare("INSERT INTO contributions (user_id, amount_paid, payment_date) VALUES (?, ?, NOW())");
        $stmt->bind_param("ii", $user_id, $amount);
        $stmt->execute();
        $stmt->close();
        
    } elseif ($transaction_type === 'loan_repayment') {
        // Automatically find active loan and deduct amount
        $loan_check = $conn->prepare("SELECT loan_id, principal_amount FROM loans WHERE user_id = ? AND status = 'Active' LIMIT 1");
        $loan_check->bind_param("i", $user_id);
        $loan_check->execute();
        $loan_res = $loan_check->get_result();

        if ($loan_res->num_rows > 0) {
            $loan = $loan_res->fetch_assoc();
            $loan_id = $loan['loan_id'];
            $new_balance = $loan['principal_amount'] - $amount;
            $new_status = ($new_balance <= 0) ? 'Paid' : 'Active';
            $new_balance = max(0, $new_balance);

            $update_loan = $conn->prepare("UPDATE loans SET principal_amount = ?, status = ? WHERE loan_id = ?");
            $update_loan->bind_param("isi", $new_balance, $new_status, $loan_id);
            $update_loan->execute();
            $update_loan->close();
        }
        $loan_check->close();
    }

    // Respond back to the gateway acknowledging receipt of the webhook
    http_response_code(200);
    echo json_encode(["status" => "received"]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "failed or invalid"]);
}
?>