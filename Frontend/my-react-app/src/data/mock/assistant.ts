import type { AskConversation } from '../../types'

export const suggestedQuestions = [
  'What is the Preamble for, in study terms?',
  'How should I start a consumer complaint?',
  'What is a Fundamental Right in Part III?',
  'Someone asked for my OTP. What should I know?',
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
          'This is a labelled demonstration of Ask Samvidhan. Replies are sample educational text. They are not retrieved from a live legal database and are not legal advice.',
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
        'In Samvidhan’s educational map, the Preamble is a compass: it names the source of authority and the values of justice, liberty, equality, and fraternity. It does not replace the articles. Confirm current official wording before quoting it.',
      sources: [
        {
          title: 'Constitution of India (official text)',
          note: 'Not retrieved in this demo. Open an authorised publication or government source.',
        },
      ],
      nextSteps: [
        'Read the Constitution Foundations lesson on the Preamble.',
        'Compare the paraphrase with an official text.',
      ],
    }
  }
  if (q.includes('consumer') || q.includes('refund') || q.includes('defective')) {
    return {
      content:
        'For a defective good or deficient service, educational first steps are: keep proof of purchase, write the defect clearly, and use the seller’s complaint channel. Statutory consumer processes exist, but this demo cannot file a case or promise a refund. Check the current Consumer Protection Act and official forum instructions.',
      sources: [
        {
          title: 'Current Consumer Protection law',
          note: 'Sample pointer only — not a retrieved, dated copy of the Act.',
        },
      ],
      nextSteps: [
        'Open the Everyday Legal Knowledge consumer lesson.',
        'Use official consumer-commission information if you escalate.',
      ],
    }
  }
  if (q.includes('otp') || q.includes('cyber') || q.includes('fraud') || q.includes('hack')) {
    return {
      content:
        'Awareness material treats unexpected OTP or remote-access requests as likely fraud. Do not share the OTP. Contact your bank using a number you already trust and consider official cyber-crime reporting. This reply is a demo; it does not report the incident for you.',
      sources: [
        {
          title: 'Official cyber crime reporting channels',
          note: 'Confirm URLs on government domains. Not fetched in this frontend milestone.',
        },
      ],
      nextSteps: [
        'If money may have moved, call the bank from a trusted number.',
        'Preserve messages; avoid spreading the malicious link.',
      ],
    }
  }
  if (q.includes('right') || q.includes('part iii') || q.includes('article 21')) {
    return {
      content:
        'Part III of the Constitution groups Fundamental Rights. Some provisions address citizens, others persons. Article 21 is widely taught as protection of life and personal liberty, with a large body of later interpretation. This demo does not retrieve judgments and must not be used as a holding from any court.',
      sources: [
        {
          title: 'Constitution of India, Part III',
          note: 'Sample educational pointer. Doctrine evolves; verify official text and current case law separately.',
        },
      ],
      nextSteps: [
        'Open the Fundamental Rights course.',
        'Read the Constitution section on Part III.',
      ],
    }
  }
  return {
    content:
      'I can offer a general educational explanation from Samvidhan’s sample materials. I do not have a live legal database in this milestone, so I will not invent a case name, section number, or “current position of law.” If you describe a provision or a practical situation, I can point you to a lesson, a library sample, or a cautious next-step checklist.',
    sources: [
      {
        title: 'Samvidhan sample curriculum',
        note: 'Frontend demonstration only. Not an official legal source.',
      },
    ],
    nextSteps: [
      'Try a suggested question, or browse Learn and the Legal Library.',
      'Consult a qualified professional for a real dispute.',
    ],
  }
}
