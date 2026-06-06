export function parseEntryFromVoice(transcript, categories) {
  const text = transcript.toLowerCase()

  const incomeKeywords = [
    'வந்தது', 'கிடைச்சது', 'விற்பனை', 'வருமானம்', 'பெற்றேன்',
    'பெறப்பட்டது', 'வாங்கினேன்', 'கிடைத்தது',
    'income', 'received', 'earned', 'sold', 'got'
  ]
  const expenseKeywords = [
    'செலவு', 'கொடுத்தேன்', 'தந்தேன்', 'போச்சு', 'வாங்கினோம்',
    'கொடு', 'செலவாச்சு', 'போயிடுச்சு',
    'expense', 'spent', 'paid', 'bought', 'gave'
  ]

  // Check income first, then expense — more specific wins
  let type = 'expense'
  if (incomeKeywords.some(k => text.includes(k))) type = 'income'
  if (expenseKeywords.some(k => text.includes(k))) type = 'expense'

  const cleanedText = text.replace(/(\d),(\d)/g, '$1$2')
const numbers = cleanedText.match(/\d+/g)
const amount = numbers ? parseInt(numbers[0]) : null

  const relevantCats = categories.filter(c => c.type === type)
  let matchedCategory = null
  for (const cat of relevantCats) {
    const catWords = cat.name.toLowerCase().split(/[\s/]+/)
    if (catWords.some(word => word.length > 2 && text.includes(word))) {
      matchedCategory = cat
      break
    }
  }

  return { type, amount, category: matchedCategory, transcript }
}

export function parseCustomerTxFromVoice(transcript) {
  const text = transcript.toLowerCase()

  const paymentKeywords = [
    'கட்டினான்', 'திரும்ப', 'கொடுத்தான்', 'பெற்றேன்',
    'பெறப்பட்டது', 'வாங்கினேன்', 'கிடைச்சது', 'வந்தது',
    'received', 'payment', 'paid back', 'got', 'paid me'
  ]
  const creditKeywords = [
    'கொடுத்தேன்', 'தந்தேன்', 'கடன்', 'கொடு',
    'credit', 'gave', 'given', 'lent', 'உதவி'
  ]

  // Check payment first — if matched, it's payment
  let type = 'credit'
  if (paymentKeywords.some(k => text.includes(k))) type = 'payment'
  if (creditKeywords.some(k => text.includes(k))) type = 'credit'

  // If both match, payment keywords take priority
  const hasPayment = paymentKeywords.some(k => text.includes(k))
  const hasCredit = creditKeywords.some(k => text.includes(k))
  if (hasPayment && hasCredit) type = 'payment'

  const cleanedText = text.replace(/(\d),(\d)/g, '$1$2')
const numbers = cleanedText.match(/\d+/g)
const amount = numbers ? parseInt(numbers[0]) : null

  return { type, amount, transcript }
}