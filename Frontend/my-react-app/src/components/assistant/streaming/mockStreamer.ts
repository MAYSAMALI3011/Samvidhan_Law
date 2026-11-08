export interface StreamChunk {
  token?: string
  citation?: { label: string; url: string; summary: string }
  followUps?: string[]
  done?: boolean
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
