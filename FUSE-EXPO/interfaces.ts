interface Bill {
    "id": number
    "merchantAccountNumber": number
    "payedAt": string | null
    "status": string
    "amount": number
    "cardId": number | null
    "category": string
    "createdAt": string
    "details": string
}

interface Card {
    id: number
    PIN: string
    accountNumber: string
    balance: number
    cardName: string
    createdAt: string
    cvv: number
    expiryDate: string
    physical: boolean
}