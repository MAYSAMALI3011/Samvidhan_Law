export interface StreamChunk {
  token?: string
  citation?: { label: string; url: string; summary: string }
  followUps?: string[]
  done?: boolean
  conversationId?: string
}

interface MockTopic {
  keywords: string[]
  title: string
  content: string
  citations: { label: string; url: string; summary: string }[]
  followUps: string[]
}

const mockKnowledgeBase: MockTopic[] = [
  {
    keywords: ['police', 'detain', 'arrest', 'custody', 'lockup', 'handcuff', 'fir'],
    title: 'Your Safeguards During Police Detention',
    content: `Under Indian law, every citizen has fundamental rights that protect them during any police questioning or detention.

### 1. Fundamental Rights Upon Detention
Under **Article 22(1)** of the Constitution of India:
* **Right to know the grounds:** Police must inform you immediately why you are being detained.
* **Right to consult a lawyer:** You have the absolute right to consult and be defended by a legal practitioner of your choice.
* **Right to inform family:** Under the *D.K. Basu Guidelines*, the police must notify a family member or friend within 8-12 hours of arrest.

### 2. Time Limits for Custody
| Safeguard | Statutory Rule | Governing Law |
| :--- | :--- | :--- |
| **Magistrate Production** | Must be produced within 24 hours | Article 22(2) & Section 57 CrPC |
| **Medical Examination** | Right to physical checkup upon arrest | Section 54 CrPC |
| **Memo of Arrest** | Signed by at least one witness | D.K. Basu Landmark Mandate |

### 3. Immediate Citizen Checklist
1. **Ask calmly:** *"Am I under arrest or free to go?"*
2. **Inspect the memo:** Ensure date, time, and location are accurately written before signing.
3. **Women detainees:** Under Section 46(4) CrPC, women cannot be arrested after sunset and before sunrise except under exceptional magistrate orders, and only by a female officer.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Article 22(1)', url: '/constitution/part-iii', summary: 'Protection against arrest and detention in certain cases.' },
      { label: 'Section 57 CrPC', url: '/library/fir-checklist', summary: 'Person arrested not to be detained more than twenty-four hours.' },
      { label: 'D.K. Basu v. State of WB', url: '/constitution/part-iii', summary: 'Mandatory guidelines for arrest memos, family intimation, and medical checks.' },
    ],
    followUps: [
      'Can police seize my phone during detention?',
      'What is a Zero FIR?',
      'How does bail work under Section 436 CrPC?',
    ],
  },
  {
    keywords: ['rti', 'information', 'transparency', 'officer', 'fees', 'application'],
    title: 'Filing an RTI (Right to Information) Query',
    content: `The **Right to Information Act, 2005** enables any Indian citizen to inspect government records, seek certified copies of documents, and demand transparency from public authorities.

### Key Steps to File an RTI
1. **Identify the Public Authority:** Find the Central or State Department holding the records.
2. **Address the PIO:** Send your application to the *Public Information Officer (PIO)*.
3. **Statutory Fee:** Pay the nominal application fee (₹10 for Central authorities, free for BPL cardholders).

### Statutory Timelines Under Section 7(1)
* **Standard Queries:** Must be answered within **30 days**.
* **Life and Liberty:** If your query concerns life or personal liberty, reply is mandatory within **48 hours**.
* **Third Party Notice:** Additional 10 days if private third-party information is requested.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Section 6(1) RTI Act', url: '/library/sample-rti-application', summary: 'Format and procedure for requesting information from public authorities.' },
      { label: 'Section 7(1) RTI Act', url: '/library/sample-rti-application', summary: 'Statutory 30-day and 48-hour response windows for PIOs.' },
      { label: 'Section 19(1) RTI Act', url: '/library/sample-rti-application', summary: 'First Appeal process if no reply is received within 30 days.' },
    ],
    followUps: [
      'What can I do if the PIO rejects my RTI query?',
      'Can private companies be questioned under RTI?',
      'How to draft an effective Section 6(1) letter?',
    ],
  },
  {
    keywords: ['article 21', 'life', 'liberty', 'privacy', 'fundamental', 'rights'],
    title: 'Article 21: Protection of Life and Personal Liberty',
    content: `**Article 21** is the golden heart of Part III of the Indian Constitution. It states:

> *"No person shall be deprived of his life or personal liberty except according to procedure established by law."*

### Expanded Dimensions of Article 21
The Supreme Court has interpreted Article 21 not merely as biological existence, but as a dignified life with meaning:
* **Right to Privacy:** Recognized as a fundamental right in *K.S. Puttaswamy (2017)*.
* **Fair Legal Procedure:** In *Maneka Gandhi (1978)*, the Court held the procedure must be just, fair, and reasonable.
* **Right to Legal Aid:** The State must provide free counsel to indigent accused under Article 39A & Article 21.
* **Right to Clean Environment:** Right to pollution-free water and air.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Article 21', url: '/constitution/part-iii', summary: 'Fundamental right to life, dignity, and personal liberty.' },
      { label: 'Maneka Gandhi (1978)', url: '/constitution/part-iii', summary: 'Due process doctrine: procedures depriving liberty must be fair, just, and reasonable.' },
      { label: 'Puttaswamy (2017)', url: '/constitution/part-iii', summary: 'Unanimous 9-judge bench holding privacy as an intrinsic part of Article 21.' },
    ],
    followUps: [
      'What is the difference between Article 19 and Article 21?',
      'How does Article 32 help enforce Article 21?',
      'Can Article 21 be suspended during an Emergency?',
    ],
  },
  {
    keywords: ['fir', 'refuse', 'police station', 'complaint', 'cognizable', 'zero fir', '154'],
    title: 'Remedies When Police Refuse to Register an FIR',
    content: `Under Indian criminal jurisprudence, police officers are legally obligated to register an FIR whenever a cognizable offense is disclosed.
    
### 1. Mandatory FIR Registration
In the Constitution Bench judgment *Lalita Kumari v. Govt of UP (2014)*, the Supreme Court ruled:
* Registration of an FIR is **mandatory** under **Section 154 CrPC** (Section 173 BNSS) if the complaint discloses the commission of a cognizable offence.
* No preliminary inquiry is permissible in such cases; police cannot refuse on grounds of territorial jurisdiction.

### 2. What is a Zero FIR?
* You can lodge an FIR at **any police station**, irrespective of where the crime took place.
* The station must register it as a "Zero FIR" and transfer it to the jurisdictional police station for investigation.

### 3. Step-by-Step Escalation if Police Refuse
1. **Approach the Superintendent of Police (SP):** Under **Section 154(3) CrPC**, send your written complaint by registered post to the SP/DCP. If satisfied, they will investigate or direct an investigation.
2. **File a Magistrate Complaint:** Under **Section 156(3) CrPC**, you can file an application before the Judicial Magistrate, who can order the police to register the FIR and investigate.
3. **Private Complaint:** File a direct complaint before the Magistrate under **Section 200 CrPC**.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Section 154 CrPC', url: '/library/fir-checklist', summary: 'Information in cognizable cases and mandatory FIR registration.' },
      { label: 'Lalita Kumari (2014)', url: '/library/fir-checklist', summary: 'Supreme Court mandate making FIR registration compulsory for cognizable crimes.' },
      { label: 'Section 156(3) CrPC', url: '/library/fir-checklist', summary: 'Magistrate power to direct investigation and FIR registration.' },
    ],
    followUps: [
      'What is the difference between an FIR and an NCR?',
      'Can police demand money or fees to register an FIR?',
      'What is the penalty for an officer who refuses to register an FIR?',
    ],
  },
  {
    keywords: ['cyber', 'otp', 'fraud', 'scam', 'bank', 'freeze', '1930', 'phishing', 'money'],
    title: 'Emergency Golden Hour Steps for Online & OTP Financial Fraud',
    content: `If you have lost money to an unauthorized online transaction, UPI scam, or OTP fraud, immediate action within the first 2-3 hours ("Golden Hour") is critical to recover funds.

### 1. Call National Cyber Helpline 1930 Immediately
* **Dial 1930** (National Cyber Crime Reporting Portal helpline, operating 24x7).
* Provide transaction ID, bank account numbers, debit/credit card details, and suspect numbers.
* The **CFCFRMS** system immediately triggers an inter-bank alert to freeze the money in the fraudster's mule account before it is withdrawn at an ATM.

### 2. Contact Your Bank Within 3 Days (Zero Liability)
* Under the **RBI Customer Protection Circular (2017)**:
  * If an unauthorized transaction occurs through third-party breach or phishing and you report it within **3 working days**, you have **ZERO liability** and the bank must credit the amount back.
  * If reported within 4-7 working days, your liability is capped at ₹5,000 to ₹10,000.
* Immediately request the bank to freeze the account/card and issue an **Acknowledgement Reference Number (ARN)**.

### 3. File Formal Cyber Complaint
* Register an official cyber incident at **cybercrime.gov.in**.
* Preserve all SMS messages, call logs, WhatsApp chats, and payment screenshots as statutory digital evidence under Section 65B of the Indian Evidence Act.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Helpline 1930', url: '/library/cyber-fraud-guide', summary: 'National Cyber Crime Reporting Portal for instantaneous fund freezing.' },
      { label: 'RBI Circular 2017', url: '/library/cyber-fraud-guide', summary: 'Customer protection - Limiting liability of customers in unauthorized electronic transactions.' },
      { label: 'Section 66D IT Act', url: '/library/cyber-fraud-guide', summary: 'Punishment for cheating by personation by using computer resources.' },
    ],
    followUps: [
      'How to request a bank chargeback for unauthorized UPI transactions?',
      'Can police retrieve money frozen under Helpline 1930 without a court order?',
      'What evidence is required to prove I did not authorize an OTP?',
    ],
  },
  {
    keywords: ['tenant', 'rent', 'landlord', 'evict', 'deposit', 'notice', 'lease', 'agreement'],
    title: 'Tenant Safeguards Against Arbitrary or Forcible Eviction',
    content: `Under Indian tenancy law, including State Rent Control Acts and the **Model Tenancy Act**, landlords cannot arbitrarily evict tenants or take the law into their own hands.

### 1. Prohibition on Forcible Eviction
* A landlord **cannot** use muscle power, lock the premises, throw belongings out, or intimidate a tenant.
* As reaffirmed by the Supreme Court in *Ramesh Gobindram (2010)*, even a tenant whose lease has expired cannot be evicted without **due process of law** through a competent civil court or Rent Authority.

### 2. Disconnection of Utilities is an Offense
* Landlords **cannot cut off essential services** such as electricity, water supply, or elevator access to force an eviction.
* Doing so violates the Rent Control Act and constitutes criminal intimidation / wrongful restraint under Section 341 of the Indian Penal Code / BNS.

### 3. Mandatory Notice Period
* Before initiating any eviction proceeding, the landlord must serve a formal written legal notice specifying:
  * The statutory ground for eviction (e.g., non-payment of rent for >2 months, bona fide personal necessity, subletting without consent).
  * A statutory notice window (typically **15 to 30 days** under Section 106 of the Transfer of Property Act 1882).

### 4. Security Deposit Refund
* The security deposit must be refunded upon handover of vacant possession after deducting genuine, documented utility arrears or agreed damage repairs.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Section 106 TP Act', url: '/library/tenant-rights-guide', summary: 'Duration of leases and mandatory 15-day / 6-month written notice requirements.' },
      { label: 'Model Tenancy Act', url: '/library/tenant-rights-guide', summary: 'Prohibition on utility cutoffs and establishment of Rent Courts for lawful disputes.' },
      { label: 'Ramesh Gobindram (2010)', url: '/library/tenant-rights-guide', summary: 'Supreme Court ruling holding eviction without due process of law illegal.' },
    ],
    followUps: [
      'What can a tenant do if a landlord disconnects electricity or water?',
      'What happens if a rental agreement is not registered?',
      'How much security deposit can a landlord legally demand?',
    ],
  },
]

export async function* streamMockChat(
  userQuery: string,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk, void, unknown> {
  const queryLower = userQuery.toLowerCase()

  // Match topic or default to general constitutional overview
  const matched = mockKnowledgeBase.find((item) =>
    item.keywords.some((kw) => queryLower.includes(kw))
  ) || {
    title: 'Constitutional Understanding & Civic Literacy',
    content: `Thank you for your question on Indian Constitutional Law.

### Core Principles of the Constitution
1. **Rule of Law (Article 14):** Every person, official, and institution is equal before the law and entitled to equal protection.
2. **Citizen Remedies (Article 32 & 226):** If your fundamental rights are violated, you can petition the High Court under Article 226 or the Supreme Court under Article 32 for constitutional writs (Habeas Corpus, Mandamus, Certiorari).
3. **Preamble Bedrock:** Sovereign authority resides unconditionally with *"We, The People of India"*.

Please consult the **Constitution Map** or **Legal Library** in your dashboard to cross-reference official statutory texts.

*Educational information, not legal advice.*`,
    citations: [
      { label: 'Article 14', url: '/constitution/part-iii', summary: 'Equality before the law and equal protection of the laws across India.' },
      { label: 'Article 32', url: '/constitution/part-iii', summary: 'Right to move Supreme Court by appropriate proceedings for enforcement of Part III rights.' },
    ],
    followUps: [
      'What are my rights if police detain me?',
      'How do I file an RTI application?',
      'What does Article 21 protect?',
    ],
  }

  // Tokenize words
  const words = matched.content.split(' ')

  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) {
      return
    }

    const word = words[i] + (i < words.length - 1 ? ' ' : '')
    // Realistic variable typing speed (15ms - 30ms)
    const delay = Math.floor(Math.random() * 18) + 14
    await new Promise((res) => setTimeout(res, delay))

    yield { token: word }
  }

  // Stream citations
  for (const c of matched.citations) {
    if (signal?.aborted) return
    await new Promise((res) => setTimeout(res, 35))
    yield { citation: c }
  }

  // Finish with follow-up suggestions
  yield {
    followUps: matched.followUps,
    done: true,
  }
}
