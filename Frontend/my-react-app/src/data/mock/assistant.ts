import type { AskConversation } from '../../types'

export const suggestedQuestions = [
  'What are my rights if stopped or questioned by police?',
  'Can police refuse to write my FIR?',
  'How do I file an RTI application for government records?',
  'What should I do immediately after an online or OTP scam?',
  'What does Article 21 protect under the Constitution?',
  'Can a landlord evict a tenant without notice?',
]

export const mockConversations: AskConversation[] = [
  {
    id: 'welcome',
    title: 'Getting started',
    messages: [
      {
        id: 'w1',
        role: 'assistant',
        createdAt: 'Demo',
        isMock: true,
        content:
          'Welcome to Ask Samvidhan! You can ask any question about the Indian Constitution, citizen rights, or legal procedures in simple English.',
      },
    ],
  },
]

export function mockAnswerFor(question: string): {
  content: string
  sources: { title: string; note: string }[]
  nextSteps: string[]
} {
  const q = question.toLowerCase()
  if (q.includes('preamble')) {
    return {
      content:
        'In Samvidhan’s lessons, the Preamble is like a compass: it tells us that authority comes from “We, the people of India” and names justice, liberty, equality, and fraternity as our main values. You can read the full text anytime in our Constitution reader.',
      sources: [
        {
          title: 'Constitution of India (official text)',
          note: 'Read the official Preamble in our Constitution reader.',
        },
      ],
      nextSteps: [
        'Read our beginner lesson on the Preamble.',
        'Explore Part III for Fundamental Rights.',
      ],
    }
  }
  if (q.includes('consumer') || q.includes('refund') || q.includes('defective')) {
    return {
      content:
        'If you received a damaged product or poor service: 1) keep your bill or receipt, 2) take photos or notes of the defect, and 3) write to the seller’s customer support. If they do not help, you can send a legal notice or file a complaint on the National Consumer Helpline (1915).',
      sources: [
        {
          title: 'Consumer Protection Act, 2019',
          note: 'Protects buyers against defective goods and unfair trade practices.',
        },
      ],
      nextSteps: [
        'Read our Everyday Legal Knowledge lesson on consumer rights.',
        'Call the National Consumer Helpline at 1915 for guidance.',
      ],
    }
  }
  if (q.includes('otp') || q.includes('cyber') || q.includes('fraud') || q.includes('hack')) {
    return {
      content:
        'Never share your OTP with anyone. If you lost money: 1) call your bank immediately to freeze your account or card, 2) dial 1930 (national cyber fraud helpline), and 3) file a report at cybercrime.gov.in. If you report within 3 days, RBI rules protect you from loss.',
      sources: [
        {
          title: 'National Cyber Crime Portal & Helpline 1930',
          note: 'Helps freeze stolen money across Indian bank accounts quickly.',
        },
      ],
      nextSteps: [
        'Call your bank from their official app or website number.',
        'File an incident report at cybercrime.gov.in.',
      ],
    }
  }
  if (q.includes('right') || q.includes('part iii') || q.includes('article 21')) {
    return {
      content:
        'Article 21 protects your right to life and personal freedom. The Supreme Court has ruled that this includes living with dignity, privacy, fair police procedures, and free legal aid if you cannot afford a lawyer.',
      sources: [
        {
          title: 'Constitution of India, Article 21',
          note: 'Guarantees protection of life and personal liberty.',
        },
      ],
      nextSteps: [
        'Open our Fundamental Rights course.',
        'Read Article 21 in the Constitution reader.',
      ],
    }
  }
  return {
    content:
      'I can give you a simple, friendly explanation of Indian laws and citizen rights. Tell me your question or daily situation, and I will share what the rules say and what steps you can take.',
    sources: [
      {
        title: 'Samvidhan Legal Guide',
        note: 'Educational overview of Indian laws and citizen rights.',
      },
    ],
    nextSteps: [
      'Try one of the suggested questions above.',
      'Explore our free courses or the Constitution reader.',
    ],
  }
}
