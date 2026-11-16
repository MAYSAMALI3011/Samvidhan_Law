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
    title: 'Your Rights if Stopped or Questioned by Police',
    content: `Under Indian law, you have clear rights that protect you if you are questioned or detained by police.

### 1. Your Main Rights
Under **Article 22(1)** of the Constitution:
* **Right to know why:** The police must tell you right away why they are detaining you.
* **Right to a lawyer:** You have the full right to talk to a lawyer of your choice.
* **Right to tell your family:** Under the *D.K. Basu Rules*, the police must inform a family member or friend within 8 to 12 hours of arrest.

### 2. Time Limits Police Must Follow
| Rule | What the Law Says | Official Section |
| :--- | :--- | :--- |
| **Go Before a Judge** | Police must bring you to a judge within 24 hours | Article 22(2) & Section 57 CrPC |
| **Health Checkup** | You have the right to a medical checkup after arrest | Section 54 CrPC |
| **Arrest Paper (Memo)** | Must be signed by at least one witness | D.K. Basu Court Rules |

### 3. What to Do Right Away
1. **Ask politely:** *"Am I under arrest or free to go?"*
2. **Check the arrest paper:** Make sure the date, time, and location are correct before signing.
3. **Rules for women:** Under Section 46(4) CrPC, women cannot be arrested after sunset or before sunrise without special permission from a judge, and only a female police officer can arrest them.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Article 22(1)', url: '/constitution/part-iii', summary: 'Right to know reasons for arrest and right to consult a lawyer.' },
      { label: 'Section 57 CrPC', url: '/library/fir-checklist', summary: 'Arrested person must be taken to a judge within 24 hours.' },
      { label: 'D.K. Basu v. State of WB', url: '/constitution/part-iii', summary: 'Supreme Court rules for arrest memos, informing family, and medical checks.' },
    ],
    followUps: [
      'Can police seize my phone during questioning?',
      'What is a Zero FIR?',
      'How does bail work under Section 436 CrPC?',
    ],
  },
  {
    keywords: ['rti', 'information', 'transparency', 'officer', 'fees', 'application'],
    title: 'How to Ask for Government Information (RTI)',
    content: `The **Right to Information (RTI) Act, 2005** lets any Indian citizen ask government offices for official records, check public work, and get copies of papers.

### 3 Simple Steps to File an RTI
1. **Find the right office:** Find the central or state department that holds the records you need.
2. **Write to the officer:** Address your application to the *Public Information Officer (PIO)*.
3. **Pay the small fee:** Pay the small fee (₹10 for central government offices; free for people with a BPL card).

### Time Limits to Get Your Reply
* **Regular questions:** Must be answered within **30 days**.
* **Life and liberty questions:** If your question is about someone's life or safety, they must reply within **48 hours**.
* **Third-party information:** If your question involves another person's private details, the office gets 10 more days.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Section 6(1) RTI Act', url: '/library/sample-rti-application', summary: 'How to write and submit a request to a public officer.' },
      { label: 'Section 7(1) RTI Act', url: '/library/sample-rti-application', summary: '30-day and 48-hour time limits for officers to reply.' },
      { label: 'Section 19(1) RTI Act', url: '/library/sample-rti-application', summary: 'How to appeal if you receive no reply within 30 days.' },
    ],
    followUps: [
      'What can I do if the officer rejects my RTI request?',
      'Can private companies be questioned under RTI?',
      'How do I write a simple RTI letter?',
    ],
  },
  {
    keywords: ['article 21', 'life', 'liberty', 'privacy', 'fundamental', 'rights'],
    title: 'Article 21: Right to Life and Personal Liberty',
    content: `**Article 21** is one of the most important parts of the Indian Constitution. It states:

> *"No person shall be deprived of his life or personal liberty except according to procedure established by law."*

### What Article 21 Means for You
The Supreme Court has ruled that "life" means living with dignity and safety, not just staying alive:
* **Right to Privacy:** The Supreme Court decided in 2017 (*Puttaswamy case*) that your privacy is a basic right.
* **Fair Legal Process:** In the *Maneka Gandhi case (1978)*, the Court ruled that any government process taking away personal freedom must be fair, just, and reasonable.
* **Free Legal Help:** If an accused person cannot afford a lawyer, the government must provide one for free under Article 39A.
* **Clean Environment:** You have the right to clean air and safe drinking water.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Article 21', url: '/constitution/part-iii', summary: 'Right to life, personal dignity, and personal liberty.' },
      { label: 'Maneka Gandhi (1978)', url: '/constitution/part-iii', summary: 'Court ruling that any law taking away freedom must be fair, just, and reasonable.' },
      { label: 'Puttaswamy (2017)', url: '/constitution/part-iii', summary: 'Supreme Court ruling confirming privacy as part of Article 21.' },
    ],
    followUps: [
      'What is the difference between Article 19 and Article 21?',
      'How does Article 32 help protect Article 21?',
      'Can Article 21 be taken away during an Emergency?',
    ],
  },
  {
    keywords: ['fir', 'refuse', 'police station', 'complaint', 'cognizable', 'zero fir', '154'],
    title: 'What to Do if Police Refuse to Write an FIR',
    content: `Under Indian law, the police cannot turn you away if you report a serious crime (a "cognizable" offense like theft, violence, or fraud).
    
### 1. Police Must Write the FIR
In the famous *Lalita Kumari (2014)* court case, the Supreme Court ruled:
* Writing an FIR is **mandatory** under **Section 154 CrPC** whenever a serious crime is reported.
* The police cannot refuse just because the crime happened in another area.

### 2. What is a Zero FIR?
* You can report a crime at **any police station**, even if the crime took place somewhere else.
* The police station must register it as a "Zero FIR" and then send the file to the correct station.

### 3. Steps to Take if Police Say No
1. **Write to the Police Superintendent (SP/DCP):** Under **Section 154(3) CrPC**, send your written complaint by registered post to the head of the district police.
2. **Go to a Local Judge (Magistrate):** Under **Section 156(3) CrPC**, you can ask a local judge to order the police to register your FIR and investigate.
3. **File a Private Complaint:** You can also file a direct complaint in front of the judge under **Section 200 CrPC**.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Section 154 CrPC', url: '/library/fir-checklist', summary: 'Mandatory registration of an FIR for serious crimes.' },
      { label: 'Lalita Kumari (2014)', url: '/library/fir-checklist', summary: 'Supreme Court rule making FIR registration compulsory.' },
      { label: 'Section 156(3) CrPC', url: '/library/fir-checklist', summary: 'Judge’s power to order police to register an FIR and investigate.' },
    ],
    followUps: [
      'What is the difference between an FIR and an NCR?',
      'Can police demand money or fees to register an FIR?',
      'What happens to an officer who refuses to register an FIR?',
    ],
  },
  {
    keywords: ['cyber', 'otp', 'fraud', 'scam', 'bank', 'freeze', '1930', 'phishing', 'money'],
    title: 'What to Do Right Away After Online or OTP Scams',
    content: `If you lost money through a fake online payment, UPI scam, or stolen OTP, acting in the first 2 to 3 hours gives you the best chance to get your money back.

### 1. Call Cyber Helpline 1930 Right Away
* **Call 1930** (the national government helpline for cybercrime, open 24/7).
* Share the transaction details, your bank account number, and the fraudster's phone or UPI details.
* The system sends an immediate alert to banks to freeze the money before the scammer can withdraw it.

### 2. Tell Your Bank Within 3 Days (Zero Loss Rule)
* Under Reserve Bank of India (RBI) rules:
  * If money is stolen without your fault and you report it within **3 working days**, you have **ZERO liability** and the bank must return your money.
  * If you report between 4 and 7 days, you may have to pay a small fixed part (up to ₹5,000 or ₹10,000).
* Ask your bank to block your card or account immediately and ask for a complaint reference number.

### 3. File a Report Online
* Report the incident at **cybercrime.gov.in**.
* Save all SMS alerts, bank messages, and screenshots as evidence.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Helpline 1930', url: '/library/cyber-fraud-guide', summary: 'National helpline to freeze stolen money quickly.' },
      { label: 'RBI Circular 2017', url: '/library/cyber-fraud-guide', summary: 'Zero liability rule for customers when fraud is reported quickly.' },
      { label: 'Section 66D IT Act', url: '/library/cyber-fraud-guide', summary: 'Punishment for online cheating and impersonation.' },
    ],
    followUps: [
      'How do I ask my bank for a chargeback on an unauthorized UPI payment?',
      'Can police return money frozen under 1930 without a court order?',
      'What proof do I need to show I did not share my OTP?',
    ],
  },
  {
    keywords: ['tenant', 'rent', 'landlord', 'evict', 'deposit', 'notice', 'lease', 'agreement'],
    title: 'Tenant Rights Against Unfair Eviction',
    content: `Under Indian rent laws and the **Model Tenancy Act**, landlords cannot force you out or take the law into their own hands.

### 1. Landlords Cannot Use Force
* A landlord **cannot** change the locks, throw your bags outside, or use threats to make you leave.
* Even if your rent agreement has ended, a landlord must follow the law and go through a court or rent authority to evict you.

### 2. Cutting Off Power or Water is Against the Law
* Landlords **cannot cut off basic services** like electricity or water to force you to leave.
* Doing this is illegal and is a criminal offense under Section 341 of the law.

### 3. Written Notice is Required
* Before asking you to leave through court, the landlord must send you a formal written notice:
  * The notice must give a valid reason (such as unpaid rent for over 2 months).
  * The notice must give you enough time (usually **15 to 30 days**).

### 4. Getting Your Security Deposit Back
* When you move out and hand over the keys, the landlord must return your security deposit. They can only deduct real unpaid bills or agreed repair costs.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Section 106 TP Act', url: '/library/tenant-rights-guide', summary: 'Rules requiring 15-day or 6-month written notice before eviction.' },
      { label: 'Model Tenancy Act', url: '/library/tenant-rights-guide', summary: 'Ban on cutting off electricity or water, and rules for rent courts.' },
      { label: 'Ramesh Gobindram (2010)', url: '/library/tenant-rights-guide', summary: 'Supreme Court ruling that landlords cannot evict tenants without court process.' },
    ],
    followUps: [
      'What can a tenant do if a landlord cuts off electricity or water?',
      'What happens if a rent agreement is not registered?',
      'How much security deposit can a landlord ask for?',
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
    title: 'Understanding Your Rights and the Constitution',
    content: `Thank you for your question on the Constitution of India.

### 3 Core Rules Every Citizen Should Know
1. **Equality Before Law (Article 14):** Every person is equal before the law and entitled to equal protection.
2. **Going to Court for Your Rights (Article 32 & 226):** If someone breaks your constitutional rights, you have the right to ask the High Court or Supreme Court to protect you.
3. **Power Comes From the People:** The Preamble states clearly that all power belongs to *"We, The People of India"*.

Explore our **Constitution Reader** or **Legal Library** to read the full laws.

*Educational information, not personal legal advice.*`,
    citations: [
      { label: 'Article 14', url: '/constitution/part-iii', summary: 'Equality before the law and equal protection across India.' },
      { label: 'Article 32', url: '/constitution/part-iii', summary: 'Right to go to the Supreme Court to protect fundamental rights.' },
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
