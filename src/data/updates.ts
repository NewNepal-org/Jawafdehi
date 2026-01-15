export interface Update {
    id: string;
    title: string;
    date: string;
    content: string;
    thumbnail?: string;
    pdfs?: {
        name: string;
        path: string;
    }[];
}

export const updates: Update[] = [
    {
        id: "2026-01-04-second-national-strategy-feedback",
        title: "Jawafdehi Submits Feedback on Nepal's Second National Anti-Corruption Strategy",
        date: "January 4, 2026 (२०८२ पुष २०)",
        content: `
We received an invitation from the Office of the Prime Minister and Council of Ministers to participate in a stakeholder consultation meeting for finalizing Nepal's Second National Strategy and Action Plan Against Corruption, 2082 (भ्रष्टाचार विरुद्धको दोस्रो राष्ट्रिय रणनीति तथा कार्ययोजना, २०८२).

We reviewed the draft strategy document and submitted our feedback at the meeting held in Singha Durbar, coordinated by the Chief Secretary.

In summary, we called for:

- Independent expert groups (legal experts, academics, journalists, civil society) in coordination mechanisms
- Clear rationale and measurable outcomes for proposed legal amendments
- Incorporation of the GenZ movement's demands, including a high-level asset investigation commission
- Digital infrastructure upgrades — high-bandwidth government websites, document digitization, and online court records
- Government funding for civic accountability initiatives to reduce foreign dependency

![Jawafdehi at the consultation meeting](/assets/updates/2026-01-04-second-national-strategy-feedback.jpeg)
*Rohan representing Jawafdehi at the stakeholder consultation in Singha Durbar*

Moving forward, we remain committed to supporting the implementation of this strategy and will continue engaging with the government on anti-corruption efforts.
`,
        thumbnail: "/assets/updates/2026-01-04-second-national-strategy-feedback.jpeg",
        pdfs: [
            {
                name: "Our Feedback Letter",
                path: "/assets/updates/our-feedback.pdf",
            },
            {
                name: "Government Strategy Document (भ्रष्टाचार विरुद्धको दोस्रो राष्ट्रिय रणनीति तथा कार्ययोजना, २०८२)",
                path: "/assets/updates/भ्रष्टाचार विरुद्धको दोस्रो राष्ट्रिय रणनीति तथा कार्ययोजना, २०८२.pdf",
            }
        ]
    }
];
