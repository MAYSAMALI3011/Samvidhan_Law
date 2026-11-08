import type { LearningUnit } from '../../types'

export const unitsData: LearningUnit[] = [
  {
    id: 1,
    slug: 'foundations-of-the-republic',
    kicker: 'UNIT 1',
    title: 'Foundations of the Republic',
    description: 'The core promises that define independent India: Sovereignty, Democracy, and the Preamble.',
    lessons: [
      {
        id: 'preamble-we-the-people',
        title: 'We, The People: The Source of Power',
        subtitle: 'Who really holds sovereign authority in India?',
        durationMinutes: 3,
        xp: 15,
        articleCitation: 'Preamble, Constitution of India (1950)',
        cards: [
          {
            id: 'c1',
            kicker: 'FOUNDATION OF INDIA',
            title: 'Power Belongs to the People',
            summary: 'The Constitution begins with four powerful words: "WE, THE PEOPLE OF INDIA". This declares that real power belongs to ordinary citizens, not just to leaders, parliament, or courts.',
            simplifiedSummary: 'In India, citizens are the true bosses. Leaders and government officers work for the people, not the other way around.',
            citizenExample: {
              title: 'The Community Park Trees (Illustrative Scenario)',
              situation: 'A municipal department starts cutting trees in a community park for a road project without putting up any public notice or project details.',
              law: 'In State of U.P. v. Raj Narain (1975), the Supreme Court ruled that in a democracy where citizens are sovereign, the public has a right to know how public officials conduct public business.',
              action: 'Under the Right to Information Act, 2005 (Section 6), any citizen can write to the Public Information Officer (PIO) with a simple application and ₹10 fee asking for approved project plans, environmental permissions, and budget orders.',
            },
            officialArticleNumber: 'Preamble',
            officialArticleText: 'WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE, social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation...',
            landmarkCase: 'State of U.P. v. Raj Narain (1975) & Kesavananda Bharati (1973)',
            glossaryTerms: [
              { term: 'Sovereign', definition: 'Completely independent. Free to make our own laws without any foreign ruler or external power telling us what to do.' },
              { term: 'Republic', definition: 'A country where the head of state is elected by the people for a fixed term, not a king or queen born into power.' }
            ],
            didYouKnow: {
              front: 'Who handwrote the original Constitution of India?',
              back: 'Master calligrapher Prem Behari Narain Raizada wrote the entire Constitution by hand in beautiful flowing calligraphy. When Prime Minister Nehru asked what he would charge, Raizada refused any money—his only request was to write his name on every page, and his grandfather\'s name on the last page!'
            },
            takeaway: 'Power in India starts with the citizens, who gave this Constitution to themselves on 26 November 1949.'
          },
          {
            id: 'c2',
            kicker: 'CIVIC SCENARIO',
            title: 'Officials Must Follow Written Law',
            summary: 'Because citizens are sovereign, government officers cannot make up rules as they go. Every official action must be backed by a written law passed by elected lawmakers.',
            simplifiedSummary: 'A police officer or government clerk cannot order you around or shut your shop on a personal whim. They must follow an official written law.',
            citizenExample: {
              title: 'The Street Vendor License Check (Illustrative Scenario)',
              situation: 'A local municipal inspector orders a licensed fruit vendor to shut down immediately, but refuses to provide any written notice, rule, or receipt.',
              law: 'Under Article 14 (Equality and Non-Arbitrariness) and Article 19(1)(g) (Right to Practice a Trade), state officials cannot take arbitrary actions without statutory legal authority.',
              action: 'The vendor has the legal right to ask for the written order or statutory rule under which the inspection is carried out, and can submit a grievance to the town vending committee.',
            },
            scenario: {
              prompt: 'A municipal officer orders a local street vendor to close down immediately without showing any municipal bye-law, notice, or written order. Can the vendor question this?',
              choices: [
                {
                  id: 'sc-1',
                  text: 'No, government officials have natural unlimited power over all public spaces.',
                  isConstitutional: false,
                  outcome: 'Incorrect. In a constitutional republic, no public official has arbitrary power. Every state action must trace back to enacted law.',
                  articleRef: 'Article 14 & Article 19(1)(g)'
                },
                {
                  id: 'sc-2',
                  text: 'Yes. State actions must be based on valid written laws, and citizens have a right to see the official authority.',
                  isConstitutional: true,
                  outcome: 'Exactly right! Under the Rule of Law, any state interference with a citizen\'s lawful work must be authorized by written legislation.',
                  articleRef: 'Article 14 & Article 21'
                }
              ]
            },
            glossaryTerms: [
              { term: 'Rule of Law', definition: 'The constitutional principle that everyone—including the Prime Minister, judges, and police—must obey the law, and no one is above it.' }
            ],
            didYouKnow: {
              front: 'Can a government order beat the Constitution?',
              back: 'Never! Article 13 guarantees that any law or government order that violates Fundamental Rights is declared null and void by the courts.'
            },
            takeaway: 'Public servants only have the powers that written laws explicitly give them.'
          },
          {
            id: 'c3',
            kicker: 'CORE VALUES',
            title: 'Justice, Liberty & Equality Must Stand Together',
            summary: 'Dr. B.R. Ambedkar explained that Liberty, Equality, and Fraternity are like three legs of a stool. If you take one leg away, the whole stool falls over and democracy fails.',
            simplifiedSummary: 'Freedom without fairness helps only the rich and strong. Fairness without freedom turns into dictatorship. Both need brotherhood (fraternity) so people treat each other like family.',
            officialArticleNumber: 'CAD Vol. XI (25 November 1949)',
            officialArticleText: 'Without equality, liberty would produce the supremacy of the few over the many. Equality without liberty would kill individual initiative. Without fraternity, liberty and equality could not become a natural course of things.',
            landmarkCase: 'Constituent Assembly Speech by Dr. B.R. Ambedkar',
            glossaryTerms: [
              { term: 'Fraternity', definition: 'A feeling of common brotherhood and mutual respect among all citizens, rising above differences of religion, caste, or region.' }
            ],
            didYouKnow: {
              front: 'How long did it take to create the Constitution?',
              back: 'The Constituent Assembly took 2 years, 11 months, and 17 days to draft the Constitution, debating every word across 11 sessions to protect future generations.'
            },
            takeaway: 'Freedom, equality, and brotherhood form an unbreakable union—we need all three for a healthy democracy.'
          }
        ],
        quizQuestions: [
          {
            id: 'q1-1',
            type: 'multiple_choice',
            prompt: 'According to the opening words of the Constitution, where does ultimate sovereign power reside?',
            options: [
              { id: 'opt-a', label: 'In the Parliament of India' },
              { id: 'opt-b', label: 'In "We, The People of India"' },
              { id: 'opt-c', label: 'In the Supreme Court of India' },
              { id: 'opt-d', label: 'In the Prime Minister and Cabinet' }
            ],
            correctOptionId: 'opt-b',
            explanation: 'The Preamble unambiguously declares "We, The People" as the fountainhead of constitutional authority.',
            citation: 'Constitution of India, Preamble'
          },
          {
            id: 'q1-2',
            type: 'true_false',
            prompt: 'True or False: Under Indian law, an executive officer can seize private property without any written statutory law.',
            options: [
              { id: 'true-opt', label: 'True — Executive orders override statutory provisions in emergency' },
              { id: 'false-opt', label: 'False — Article 300A mandates that no person shall be deprived of property save by authority of law' }
            ],
            correctOptionId: 'false-opt',
            explanation: 'Article 300A guarantees that deprivation of property can only occur by authority of a validly enacted law.',
            citation: 'Constitution of India, Article 300A'
          },
          {
            id: 'q1-3',
            type: 'match_pairs',
            prompt: 'Match each constitutional term to its plain-English meaning:',
            pairs: [
              { id: 'p1', left: 'Sovereign', right: 'Free from foreign dominion' },
              { id: 'p2', left: 'Republic', right: 'No hereditary monarch' },
              { id: 'p3', left: 'Fraternity', right: 'Spirit of civic brotherhood' },
              { id: 'p4', left: 'Liberty', right: 'Freedom of thought & belief' }
            ],
            explanation: 'The Preamble outlines these four core promises to establish an egalitarian democracy.',
            citation: 'Preamble Philosophy'
          },
          {
            id: 'q1-4',
            type: 'fill_blank',
            prompt: 'Complete the landmark quote by Dr. B.R. Ambedkar:',
            sentenceWithBlank: 'Without [blank], liberty would produce the supremacy of the few over the many.',
            blankCorrectWord: 'equality',
            wordBank: ['equality', 'monarchy', 'property', 'taxes', 'censorship'],
            explanation: 'Dr. Ambedkar explained that liberty without equality creates oligarchic domination.',
            citation: 'CAD Vol. XI, 25 Nov 1949'
          },
          {
            id: 'q1-5',
            type: 'spot_violation',
            prompt: 'Read the three statements below. Tap on the unconstitutional statement:',
            spotSentences: [
              { id: 's1', text: 'All citizens have the right to equal protection of the laws under Article 14.', isViolation: false },
              { id: 's2', text: 'The police department can indefinitely ban protests without any written security assessment.', isViolation: true },
              { id: 's3', text: 'Every law passed by legislature is subject to judicial review for fundamental rights compliance.', isViolation: false }
            ],
            explanation: 'Under Article 19(1)(b) & Ramlila Maidan incident (2012), bans on peaceful assembly require recorded objective grounds.',
            citation: 'Article 19(1)(b) & Article 19(3)'
          }
        ]
      },
      {
        id: 'basic-structure-limits',
        title: 'Basic Structure: Can Parliament Change Anything?',
        subtitle: 'The 1973 landmark ruling that saved Indian democracy.',
        durationMinutes: 4,
        xp: 20,
        articleCitation: 'Article 368 & Kesavananda Bharati (1973)',
        cards: [
          {
            id: 'c2-1',
            kicker: 'LANDMARK CASE',
            title: 'Kesavananda Bharati v. State of Kerala (1973)',
            summary: 'Can an elected government with a parliamentary majority amend the Constitution to abolish elections, destroy judicial independence, or cancel basic rights? The Supreme Court answered with a clear NO.',
            simplifiedSummary: 'Even if all politicians vote together, they cannot destroy the core foundations of the Constitution—such as free elections or independent courts.',
            officialArticleNumber: 'Article 368',
            officialArticleText: 'Power of Parliament to amend the Constitution and procedure therefor... Provided that nothing in this article shall be held to enable Parliament to alter the basic structure or framework of the Constitution.',
            landmarkCase: 'Kesavananda Bharati (1973) 4 SCC 225 (13-Judge Bench)',
            glossaryTerms: [
              { term: 'Basic Structure', definition: 'The core constitutional identity (democracy, secularism, rule of law, independent courts) that cannot be taken away by any amendment.' },
              { term: 'Article 368', definition: 'The constitutional article describing how amendments can be proposed and voted upon.' }
            ],
            didYouKnow: {
              front: 'How close was the Kesavananda Bharati verdict?',
              back: 'It was decided by the narrowest possible margin: 7 judges in favor against 6 judges dissenting, in a historic 68-day hearing before 13 Supreme Court judges!'
            },
            takeaway: 'Parliament has the power to amend the Constitution, but NOT the power to destroy its identity.'
          },
          {
            id: 'c2-2',
            kicker: 'STEP-BY-STEP PROCEDURE',
            title: 'How Laws Are Tested Against the Constitution',
            summary: 'When a new constitutional amendment is passed by Parliament, any citizen can challenge it before the Supreme Court under Article 32.',
            simplifiedSummary: 'If Parliament passes an amendment that damages democracy or judicial freedom, the Supreme Court can strike it down as unconstitutional.',
            takeaway: 'The judiciary acts as the ultimate constitutional referee.'
          }
        ],
        quizQuestions: [
          {
            id: 'q2-1',
            type: 'multiple_choice',
            prompt: 'In the landmark 1973 Kesavananda Bharati judgment, what did the 13-judge bench establish?',
            options: [
              { id: 'opt-a', label: 'Parliament can amend any and every part of the Constitution without limits' },
              { id: 'opt-b', label: 'The Basic Structure of the Constitution cannot be amended or destroyed' },
              { id: 'opt-c', label: 'The President has veto power over all judicial appointments' },
              { id: 'opt-d', label: 'Fundamental rights can be permanently suspended during peacetime' }
            ],
            correctOptionId: 'opt-b',
            explanation: 'The Supreme Court ruled that amending power under Article 368 is not unlimited and cannot alter the basic structure.',
            citation: 'Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225'
          },
          {
            id: 'q2-2',
            type: 'order_steps',
            prompt: 'Put the steps of testing an amendment against the Basic Structure in correct chronological order:',
            steps: [
              { id: 'st-1', label: 'Parliament passes Constitutional Amendment Bill with 2/3rd majority', order: 1 },
              { id: 'st-2', label: 'President accords assent and the amendment is gazetted', order: 2 },
              { id: 'st-3', label: 'Citizen or petitioner files writ petition challenging the amendment', order: 3 },
              { id: 'st-4', label: 'Supreme Court tests if amendment destroys core identity (Basic Structure)', order: 4 }
            ],
            explanation: 'Judicial review occurs after enactment when the statutory measure is tested against constitutional standards.',
            citation: 'Article 13, 32 & 368'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    slug: 'fundamental-rights-in-practice',
    kicker: 'UNIT 2',
    title: 'Part III: Fundamental Rights in Practice',
    description: 'Enforceable shields against state injustice: Equality, Speech, Life, and Writs.',
    lessons: [
      {
        id: 'article-14-equality-safeguard',
        title: 'Article 14: The Shield Against Arbitrary Power',
        subtitle: 'Why the government cannot pick favorites or act on whims.',
        durationMinutes: 3,
        xp: 15,
        articleCitation: 'Article 14, Constitution of India',
        cards: [
          {
            id: 'c3-1',
            kicker: 'EQUALITY BEFORE LAW',
            title: 'Equality Means No Arbitrary Treatment',
            summary: 'Article 14 states that the State shall not deny to any person equality before the law or equal protection of the laws within India. In the E.P. Royappa case, Justice Bhagwati declared that equality is the opposite of arbitrariness.',
            simplifiedSummary: 'The government cannot treat you unfairly just because an official feels like it. Every decision must have a fair, logical reason.',
            officialArticleNumber: 'Article 14',
            officialArticleText: '14. Equality before law.—The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
            landmarkCase: 'E.P. Royappa v. State of Tamil Nadu (1974) & Maneka Gandhi (1978)',
            takeaway: 'Wherever there is arbitrariness, equality is denied.'
          }
        ],
        quizQuestions: [
          {
            id: 'q3-1',
            type: 'multiple_choice',
            prompt: 'Under Article 14, does "any person" protect only Indian citizens, or foreign nationals as well?',
            options: [
              { id: 'opt-a', label: 'Only natural-born Indian citizens' },
              { id: 'opt-b', label: 'Both citizens and non-citizens within the territory of India' },
              { id: 'opt-c', label: 'Only government employees and registered voters' },
              { id: 'opt-d', label: 'Only persons with taxable income' }
            ],
            correctOptionId: 'opt-b',
            explanation: 'Article 14 uses the word "person", unlike Article 19 which specifically uses "citizens". Hence equality applies to all persons.',
            citation: 'Constitution of India, Article 14'
          }
        ]
      }
    ]
  }
]
